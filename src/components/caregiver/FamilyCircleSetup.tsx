import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActiveTeam } from "../../context/ActiveTeam";
import { cvCreateInvite, cvCreateTeamWithPatient } from "../../lib/cv";
import { hasActivePlan, useUserPlan } from "../../hooks/useUserPlan";
import { useLocale } from "../../i18n/LocaleContext";
import { Loading } from "../ui/Loading";
import { Copy, Check, Users, ArrowRight, CircleAlert as AlertCircle } from "lucide-react";

type Invite = { name: string; email: string };
type GeneratedLink = { email: string; link: string };

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* silent */
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

export default function FamilyCircleSetup() {
  const navigate = useNavigate();
  const { teamId, refresh: refreshTeam } = useActiveTeam();
  const { t, isLoading: translationsLoading } = useLocale();
  const { data: plan } = useUserPlan();
  const [patient, setPatient] = useState("");
  const [invites, setInvites] = useState<Invite[]>([
    { name: "", email: "" },
    { name: "", email: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [done, setDone] = useState(false);

  const eligible = plan?.plan_id === "family_qtr" && hasActivePlan(plan) && !teamId;

  if (!eligible) return null;
  if (translationsLoading) return <Loading />;

  async function onCreate() {
    setBusy(true);
    setError(null);
    setGeneratedLinks([]);
    try {
      if (!patient.trim()) throw new Error(t("family_setup.patient_required"));

      const newTeamId = await cvCreateTeamWithPatient({
        name: `${patient.trim()} Family Circle`,
        plan_id: "family_qtr",
        patient_name: patient.trim(),
        gender: "unknown",
      });
      await refreshTeam();

      const linksOut: GeneratedLink[] = [];
      for (const row of invites) {
        const email = row.email.trim();
        if (!email) continue;
        const result = await cvCreateInvite(newTeamId, email);
        linksOut.push({
          email,
          link: `${location.origin}/join?t=${encodeURIComponent(result.token)}`,
        });
      }
      setGeneratedLinks(linksOut);
      setDone(true);
    } catch (e: any) {
      setError(e.message ?? t("family_setup.create_failed"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t("family_setup.done_title")}</h2>
            <p className="text-sm text-slate-500">{t("family_setup.done_subtitle")}</p>
          </div>
        </div>

        {generatedLinks.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">{t("family_setup.invite_links_title")}</p>
            {generatedLinks.map(({ email, link }, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <p className="text-xs font-medium text-slate-600">{email}</p>
                <div className="flex items-start gap-2">
                  <code className="flex-1 text-xs font-mono text-slate-700 break-all bg-white border border-slate-200 rounded px-2 py-1.5">
                    {link}
                  </code>
                  <CopyButton text={link} label={t("team.copy_link")} />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-500">{t("family_setup.invite_links_note")}</p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">{t("family_setup.manage_hint")}</p>
          <button
            onClick={() => navigate("/team")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            {t("family_setup.go_to_circle")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-1">{t("family_setup.title")}</h2>
      <p className="text-slate-600 mb-5 text-sm">{t("family_setup.subtitle")}</p>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <label className="block mb-1.5 text-sm font-medium text-slate-700">
        {t("family_setup.patient_label")}
      </label>
      <input
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
        placeholder={t("family_setup.patient_placeholder")}
        className="border border-slate-300 rounded-lg px-3 py-2 w-full mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {invites.map((row, i) => (
          <div key={i} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {t("family_setup.invite_label")} {i + 1}{" "}
              <span className="font-normal text-slate-400">{t("common.optional_parens")}</span>
            </label>
            <input
              value={row.name}
              onChange={(e) => {
                const c = [...invites];
                c[i].name = e.target.value;
                setInvites(c);
              }}
              placeholder={t("family_setup.caregiver_name_placeholder")}
              className="border border-slate-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
            <input
              type="email"
              value={row.email}
              onChange={(e) => {
                const c = [...invites];
                c[i].email = e.target.value;
                setInvites(c);
              }}
              placeholder={t("team.invite_placeholder")}
              className="border border-slate-300 rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={onCreate}
          disabled={busy || !patient.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
        >
          {busy ? t("common.creating") : t("family_setup.create_btn")}
        </button>
      </div>
    </div>
  );
}
