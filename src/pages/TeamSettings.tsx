// src/pages/TeamSettings.tsx
import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useActiveTeam } from "../context/ActiveTeam";
import { useAuth } from "../hooks/useAuth";
import { useUserPlan } from "../hooks/useUserPlan";
import {
  cvAmIOwner,
  cvCreateInvite,
  cvGetTeamResident,
  cvListInvites,
  cvListMembersWithProfile,
  cvRemoveMember,
  cvRevokeInvite,
  cvSendInviteEmail,
  type CvInvite,
  type CvMember,
} from "../lib/cv";
import { useLocale } from "../i18n/LocaleContext";
import { useFormatDate } from "../hooks/useFormatDate";
import { Users, UserMinus, Send, Copy, Check, Clock, UserCheck, Crown, RefreshCw, CircleAlert as AlertCircle, Trash2 } from "lucide-react";

type PageState = "loading" | "ready" | "error";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function InviteStatusBadge({ invite, t }: { invite: CvInvite; t: (k: string) => string }) {
  const now = new Date();
  if (invite.consumed_at) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <UserCheck className="w-3 h-3" />
        {t("team.invite_status_accepted")}
      </span>
    );
  }
  if (new Date(invite.expires_at) < now) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
        <Clock className="w-3 h-3" />
        {t("team.invite_status_expired")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" />
      {t("team.invite_status_pending")}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* silent fallback */
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={label}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
        border-cyan-300 text-cyan-700 bg-cyan-50 hover:bg-cyan-100 active:scale-95 flex-shrink-0"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

export default function TeamSettings() {
  const { data: plan, isLoading: planLoading } = useUserPlan();
  const { teamId, loading: teamLoading } = useActiveTeam();
  const { loading: authLoading } = useAuth();
  const { t } = useLocale();
  const { formatDate } = useFormatDate();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [members, setMembers] = useState<CvMember[]>([]);
  const [invites, setInvites] = useState<CvInvite[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [resident, setResident] = useState<{ full_name: string } | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteResult, setInviteResult] = useState<{ link: string; expires_at: string; emailSent: boolean; emailError?: string } | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const isPlanAllowed = !planLoading && plan?.plan_id === "family_qtr";

  const loadData = useCallback(async () => {
    if (!teamId || !isPlanAllowed) return;
    setPageState("loading");
    setErrorMsg(null);
    try {
      const [mems, owner, invs, pat] = await Promise.all([
        cvListMembersWithProfile(teamId),
        cvAmIOwner(teamId),
        cvListInvites(teamId),
        cvGetTeamResident(teamId),
      ]);
      setMembers(mems);
      setIsOwner(owner);
      setInvites(invs);
      setResident(pat);
      setPageState("ready");
    } catch (e: any) {
      setErrorMsg(e.message ?? t("team.load_failed"));
      setPageState("error");
    }
  }, [teamId, isPlanAllowed, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (authLoading || planLoading || teamLoading) return null;
  if (!isPlanAllowed) return <Navigate to="/caregiver" replace />;

  if (!teamId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">{t("team.no_team")}</p>
          <a href="/caregiver" className="mt-4 inline-block text-cyan-600 text-sm hover:underline">
            {t("team.go_to_dashboard")}
          </a>
        </div>
      </div>
    );
  }

  async function onSendInvite() {
    if (!teamId || !inviteEmail.trim()) return;
    setInviteBusy(true);
    setInviteError(null);
    setInviteResult(null);
    try {
      const result = await cvCreateInvite(teamId, inviteEmail.trim());
      const link = `${window.location.origin}/join?t=${encodeURIComponent(result.token)}`;

      const ownerName = members.find((m) => m.role === "owner")?.display_name;
      const { sent, error: emailErr } = await cvSendInviteEmail({
        email: inviteEmail.trim(),
        invite_link: link,
        team_name: resident?.full_name ? `${resident.full_name}'s care team` : undefined,
        inviter_name: ownerName || undefined,
      });

      setInviteResult({ link, expires_at: result.expires_at, emailSent: sent, emailError: emailErr });
      setInviteEmail("");
      const refreshed = await cvListInvites(teamId);
      setInvites(refreshed);
    } catch (e: any) {
      setInviteError(e.message ?? t("team.invite_failed"));
    } finally {
      setInviteBusy(false);
    }
  }

  async function onRemoveMember(userId: string) {
    if (!teamId) return;
    setRemovingId(userId);
    setErrorMsg(null);
    try {
      await cvRemoveMember(teamId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch (e: any) {
      setErrorMsg(e.message ?? t("team.remove_failed"));
    } finally {
      setRemovingId(null);
    }
  }

  async function onRevokeInvite(inviteId: string) {
    setRevokingId(inviteId);
    setErrorMsg(null);
    try {
      await cvRevokeInvite(inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (e: any) {
      setErrorMsg(e.message ?? t("team.revoke_failed"));
    } finally {
      setRevokingId(null);
    }
  }

  const pendingInvites = invites.filter(
    (i) => !i.consumed_at && new Date(i.expires_at) >= new Date()
  );
  const pastInvites = invites.filter(
    (i) => i.consumed_at || new Date(i.expires_at) < new Date()
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("team.title")}</h1>
          {resident && (
            <p className="mt-1 text-slate-500 text-sm">
              {t("team.caring_for")}{" "}
              <span className="font-medium text-slate-700">{resident.full_name}</span>
            </p>
          )}
        </div>
        <button
          onClick={loadData}
          title={t("common.refresh")}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Global error banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {pageState === "loading" && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {pageState === "ready" && (
        <>
          {/* How-it-works callout */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-sm text-cyan-800 space-y-1">
            <p className="font-medium">{t("team.how_it_works_title")}</p>
            <p>{t("team.how_it_works_body")}</p>
          </div>

          {/* Members */}
          <section>
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              {t("team.caregivers_title")}
              <span className="text-xs font-normal text-slate-400">({members.length})</span>
            </h2>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {members.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">{t("team.no_members")}</div>
              )}
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center gap-3 px-4 py-3 bg-white">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {initials(m.display_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-900 truncate">{m.display_name}</span>
                      {m.role === "owner" && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <Crown className="w-2.5 h-2.5" />
                          {t("team.role_owner")}
                        </span>
                      )}
                      {m.state === "frozen" && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          {t("team.state_frozen")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{m.email}</p>
                  </div>

                  <div className="hidden sm:block text-xs text-slate-400 flex-shrink-0">
                    {t("team.joined")} {formatDate(m.joined_at)}
                  </div>

                  {isOwner && m.role !== "owner" && (
                    <button
                      onClick={() => onRemoveMember(m.user_id)}
                      disabled={removingId === m.user_id}
                      title={t("team.remove_member")}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {removingId === m.user_id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserMinus className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Invite form — owner only */}
          {isOwner && (
            <section className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Send className="w-4 h-4 text-slate-500" />
                  {t("team.invite_title")}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{t("team.invite_description")}</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("team.invite_placeholder")}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSendInvite()}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                <button
                  onClick={onSendInvite}
                  disabled={inviteBusy || !inviteEmail.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                >
                  {inviteBusy ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {inviteBusy ? t("common.sending") : t("team.invite_btn")}
                </button>
              </div>

              {inviteError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {inviteError}
                </div>
              )}

              {inviteResult && (
                <div className={`rounded-xl border p-4 space-y-3 ${inviteResult.emailSent ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                  {inviteResult.emailSent ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-emerald-800">
                        Invitation email sent! They'll receive it shortly.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          Email could not be sent automatically.
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Please share the invite link below directly with your team member.
                          {inviteResult.emailError && (
                            <span className="block mt-1 text-amber-600 font-mono">{inviteResult.emailError}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 mb-1.5">
                      {inviteResult.emailSent
                        ? "You can also share this link directly:"
                        : "Send this link to your team member:"}
                    </p>
                    <div className="flex items-start gap-2">
                      <code className={`flex-1 text-xs border rounded-lg px-3 py-2 break-all font-mono ${inviteResult.emailSent ? "bg-white border-emerald-200 text-slate-700" : "bg-white border-amber-200 text-slate-700"}`}>
                        {inviteResult.link}
                      </code>
                      <CopyButton text={inviteResult.link} label={t("team.copy_link")} />
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {t("team.invite_expires_on").replace("{date}", formatDate(inviteResult.expires_at))}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Pending invitations */}
          {isOwner && pendingInvites.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-3">{t("team.pending_invites_title")}</h2>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{inv.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {t("team.invite_sent")} {formatDate(inv.created_at)} &middot;{" "}
                        {t("team.invite_expires_label")} {formatDate(inv.expires_at)}
                      </p>
                    </div>
                    <InviteStatusBadge invite={inv} t={t} />
                    <button
                      onClick={() => onRevokeInvite(inv.id)}
                      disabled={revokingId === inv.id}
                      title={t("team.revoke_invite")}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {revokingId === inv.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Past invitations */}
          {isOwner && pastInvites.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-slate-800 mb-3">{t("team.past_invites_title")}</h2>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {pastInvites.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3 bg-white opacity-75">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{inv.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(inv.created_at)}</p>
                    </div>
                    <InviteStatusBadge invite={inv} t={t} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
