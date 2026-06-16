// Shared HTML email template builders for all CarerView transactional emails.
// Every builder calls wrapEmail() to get consistent branding.

const LOGO_URL = "https://carerview.com/CareView_logo_1_colored_highres.png";
const SITE_URL = "https://carerview.com";
const PRIVACY_URL = "https://carerview.com/privacy-policy";

function wrapEmail(params: {
  previewText: string;
  headerBadge: string;
  title: string;
  bodyHtml: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escHtml(params.title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f0f4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d3748; -webkit-text-size-adjust: 100%; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #e6faf9 0%, #f0faf7 100%); padding: 28px 40px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; }
    .logo { width: 64px; height: 64px; object-fit: contain; }
    .brand-text .label { font-size: 10px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 3px; }
    .brand-text .name { font-size: 22px; font-weight: 800; color: #1a202c; letter-spacing: -0.5px; }
    .brand-text .tagline { font-size: 11px; color: #4a5568; margin-top: 4px; line-height: 1.5; }
    .body { padding: 36px 40px; }
    .title { font-size: 20px; font-weight: 700; color: #1a202c; margin-bottom: 14px; }
    .text { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 16px; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta-btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 10px; letter-spacing: 0.2px; }
    .link-fallback { font-size: 12px; color: #718096; line-height: 1.6; word-break: break-all; margin-top: 12px; }
    .link-fallback a { color: #0d9488; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .highlight-box { background: #f0fdfa; border-radius: 10px; padding: 16px 20px; border-left: 3px solid #0d9488; margin-bottom: 16px; }
    .highlight-box p { font-size: 13px; color: #134e4a; line-height: 1.6; }
    .warning-box { background: #fffbeb; border-radius: 10px; padding: 16px 20px; border-left: 3px solid #d69e2e; margin-bottom: 16px; }
    .warning-box p { font-size: 13px; color: #744210; line-height: 1.6; }
    .footer { background-color: #f7fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center; }
    .footer-text { font-size: 11px; color: #a0aec0; line-height: 1.7; }
    .footer-text a { color: #718096; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .wrapper { margin: 0; border-radius: 0; }
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;color:#f0f4f8;font-size:1px;">${escHtml(params.previewText)}</div>
  <div class="wrapper">
    <div class="header">
      <img src="${LOGO_URL}" alt="CarerView Logo" class="logo" width="64" height="64" />
      <div class="brand-text">
        <div class="label">${escHtml(params.headerBadge)}</div>
        <div class="name">CARERVIEW</div>
        <div class="tagline">Better Family and In-Home Caregiving<br>through Clear Observations</div>
      </div>
    </div>
    <div class="body">
      ${params.bodyHtml}
    </div>
    <div class="footer">
      <p class="footer-text">
        &copy; ${new Date().getFullYear()} CarerView &nbsp;&middot;&nbsp;
        <a href="${SITE_URL}">carerview.com</a>
        &nbsp;&middot;&nbsp;
        <a href="${PRIVACY_URL}">Privacy Policy</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:CarerView@grifdigi.com">CarerView@grifdigi.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Team invite ────────────────────────────────────────────────────────────────

export function buildTeamInviteEmail(params: {
  inviterName: string;
  teamName: string;
  inviteLink: string;
}): string {
  const { inviterName, teamName, inviteLink } = params;
  const body = `
    <h1 class="title">You've been invited to join a care team</h1>
    <p class="text">
      <strong>${escHtml(inviterName)}</strong> has invited you to collaborate on
      <strong>${escHtml(teamName)}</strong> on CarerView — the platform that helps families
      and caregivers track observations clearly and communicate effectively.
    </p>
    <div class="cta-wrap">
      <a href="${escHtml(inviteLink)}" class="cta-btn">Accept Invitation</a>
    </div>
    <p class="link-fallback">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${escHtml(inviteLink)}">${escHtml(inviteLink)}</a>
    </p>
    <hr class="divider" />
    <div class="warning-box">
      <p>This invitation link expires in 24 hours. If you were not expecting this invitation, you can safely ignore this email.</p>
    </div>`;

  return wrapEmail({
    previewText: `${inviterName} invited you to join ${teamName} on CarerView`,
    headerBadge: "Team Invitation",
    title: "You've been invited to join a care team",
    bodyHtml: body,
  });
}

// ── Guest observer invite ──────────────────────────────────────────────────────

export function buildGuestInviteEmail(params: {
  guestName: string;
  inviterName: string;
  residentName: string;
  formType: string;
  guestLink: string;
}): string {
  const { guestName, inviterName, residentName, formType, guestLink } = params;

  const formLabel =
    formType === "COMPREHENSIVE"
      ? "ADL + IADL (Comprehensive)"
      : formType === "ADL"
      ? "Activities of Daily Living (ADL)"
      : "Instrumental Activities of Daily Living (IADL)";

  const greeting = guestName ? `Hi ${escHtml(guestName)},` : "Hello,";

  const body = `
    <h1 class="title">You've been asked to complete a guest observation</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      <strong>${escHtml(inviterName)}</strong> has invited you to submit a
      <strong>${escHtml(formLabel)}</strong> observation for
      <strong>${escHtml(residentName)}</strong> on CarerView.
    </p>
    <p class="text">
      No account is needed — just click the button below and complete the short form.
    </p>
    <div class="cta-wrap">
      <a href="${escHtml(guestLink)}" class="cta-btn">Complete Observation</a>
    </div>
    <p class="link-fallback">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <a href="${escHtml(guestLink)}">${escHtml(guestLink)}</a>
    </p>
    <hr class="divider" />
    <div class="highlight-box">
      <p>This link expires in 72 hours and can only be used once. If you were not expecting this request, you can safely ignore this email.</p>
    </div>`;

  return wrapEmail({
    previewText: `${inviterName} would like your observation for ${residentName}`,
    headerBadge: "Guest Observation Request",
    title: "Guest observation request",
    bodyHtml: body,
  });
}

// ── Account deletion confirmation ──────────────────────────────────────────────

export function buildAccountDeletionEmail(params: {
  displayName: string;
}): string {
  const { displayName } = params;
  const greeting = displayName ? `Hi ${escHtml(displayName)},` : "Hello,";

  const body = `
    <h1 class="title">Your CarerView account has been deleted</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      This email confirms that your CarerView account and all associated data have been
      permanently deleted as requested. This action cannot be undone.
    </p>
    <div class="highlight-box">
      <p>
        <strong>What was deleted:</strong> your profile, observations, care team memberships,
        and subscription records. Any active subscriptions have been cancelled.
      </p>
    </div>
    <p class="text">
      If you did not request this deletion, or if you have any questions, please contact us
      immediately at <a href="mailto:CarerView@grifdigi.com" style="color:#0d9488;">CarerView@grifdigi.com</a>.
    </p>
    <p class="text">
      We're sorry to see you go. Thank you for using CarerView.
    </p>`;

  return wrapEmail({
    previewText: "Your CarerView account has been permanently deleted",
    headerBadge: "Account Notification",
    title: "Account deletion confirmed",
    bodyHtml: body,
  });
}

// ── Member joined notification (to team owner) ─────────────────────────────────

export function buildMemberJoinedEmail(params: {
  ownerName: string;
  newMemberName: string;
  newMemberEmail: string;
  teamName: string;
  dashboardLink: string;
}): string {
  const { ownerName, newMemberName, newMemberEmail, teamName, dashboardLink } = params;
  const greeting = ownerName ? `Hi ${escHtml(ownerName)},` : "Hello,";

  const body = `
    <h1 class="title">A new member has joined your care team</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      <strong>${escHtml(newMemberName)}</strong> (${escHtml(newMemberEmail)}) has accepted
      your invitation and joined <strong>${escHtml(teamName)}</strong> on CarerView.
    </p>
    <div class="cta-wrap">
      <a href="${escHtml(dashboardLink)}" class="cta-btn">View Your Dashboard</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(dashboardLink)}">${escHtml(dashboardLink)}</a>
    </p>`;

  return wrapEmail({
    previewText: `${newMemberName} has joined ${teamName} on CarerView`,
    headerBadge: "Team Update",
    title: "New team member",
    bodyHtml: body,
  });
}

// ── Welcome email (first sign-in) ─────────────────────────────────────────────

export function buildWelcomeEmail(params: {
  displayName: string;
  dashboardLink: string;
}): string {
  const { displayName, dashboardLink } = params;
  const greeting = displayName ? `Hi ${escHtml(displayName)},` : "Hello,";

  const body = `
    <h1 class="title">Welcome to CarerView — you're all set</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      Thank you for creating your CarerView account. You now have access to tools that help families
      and in-home caregivers track observations clearly and communicate more effectively.
    </p>
    <div class="highlight-box">
      <p>
        <strong>Get started:</strong> Set up your first care team, invite collaborators,
        and start logging observations from your dashboard.
      </p>
    </div>
    <div class="cta-wrap">
      <a href="${escHtml(dashboardLink)}" class="cta-btn">Go to Your Dashboard</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(dashboardLink)}">${escHtml(dashboardLink)}</a>
    </p>
    <hr class="divider" />
    <p class="text" style="font-size:13px;color:#718096;">
      If you have any questions, reply to this email or reach us at
      <a href="mailto:CarerView@grifdigi.com" style="color:#0d9488;">CarerView@grifdigi.com</a>.
    </p>`;

  return wrapEmail({
    previewText: "Your CarerView account is ready — head to your dashboard to get started",
    headerBadge: "Welcome",
    title: "Welcome to CarerView",
    bodyHtml: body,
  });
}

// ── Subscription confirmed ─────────────────────────────────────────────────────

export function buildSubscriptionConfirmedEmail(params: {
  displayName: string;
  planName: string;
  periodEnd: string;
  dashboardLink: string;
}): string {
  const { displayName, planName, periodEnd, dashboardLink } = params;
  const greeting = displayName ? `Hi ${escHtml(displayName)},` : "Hello,";

  const body = `
    <h1 class="title">Your ${escHtml(planName)} subscription is active</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      Your <strong>${escHtml(planName)}</strong> subscription is now active. You have full access
      to all included features until <strong>${escHtml(periodEnd)}</strong>.
    </p>
    <div class="highlight-box">
      <p>
        <strong>What's included:</strong> Unlimited observations, full care team collaboration,
        and access to all CarerView tools for your plan.
      </p>
    </div>
    <div class="cta-wrap">
      <a href="${escHtml(dashboardLink)}" class="cta-btn">Go to Your Dashboard</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(dashboardLink)}">${escHtml(dashboardLink)}</a>
    </p>
    <hr class="divider" />
    <p class="text" style="font-size:13px;color:#718096;">
      To manage your subscription, visit your account billing settings. Questions?
      Contact us at <a href="mailto:CarerView@grifdigi.com" style="color:#0d9488;">CarerView@grifdigi.com</a>.
    </p>`;

  return wrapEmail({
    previewText: `Your CarerView ${planName} subscription is now active`,
    headerBadge: "Subscription",
    title: `${planName} subscription confirmed`,
    bodyHtml: body,
  });
}

// ── Payment receipt ────────────────────────────────────────────────────────────

export function buildPaymentReceiptEmail(params: {
  displayName: string;
  planName: string;
  amountFormatted: string;
  invoiceDate: string;
  invoiceUrl?: string;
  dashboardLink: string;
}): string {
  const { displayName, planName, amountFormatted, invoiceDate, invoiceUrl, dashboardLink } = params;
  const greeting = displayName ? `Hi ${escHtml(displayName)},` : "Hello,";

  const invoiceSection = invoiceUrl
    ? `<div class="cta-wrap"><a href="${escHtml(invoiceUrl)}" class="cta-btn">View Invoice</a></div>
       <p class="link-fallback"><a href="${escHtml(invoiceUrl)}">${escHtml(invoiceUrl)}</a></p>`
    : `<div class="cta-wrap"><a href="${escHtml(dashboardLink)}" class="cta-btn">View Dashboard</a></div>`;

  const body = `
    <h1 class="title">Payment receipt — ${escHtml(amountFormatted)}</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      Thank you for your payment. Here is your receipt for the
      <strong>${escHtml(planName)}</strong> subscription.
    </p>
    <div class="highlight-box">
      <p>
        <strong>Date:</strong> ${escHtml(invoiceDate)}<br />
        <strong>Plan:</strong> ${escHtml(planName)}<br />
        <strong>Amount:</strong> ${escHtml(amountFormatted)}
      </p>
    </div>
    ${invoiceSection}
    <hr class="divider" />
    <p class="text" style="font-size:13px;color:#718096;">
      Questions about your billing? Contact us at
      <a href="mailto:CarerView@grifdigi.com" style="color:#0d9488;">CarerView@grifdigi.com</a>.
    </p>`;

  return wrapEmail({
    previewText: `CarerView payment receipt — ${amountFormatted} for ${planName}`,
    headerBadge: "Payment Receipt",
    title: `Payment receipt — ${amountFormatted}`,
    bodyHtml: body,
  });
}

// ── Payment failed ─────────────────────────────────────────────────────────────

export function buildPaymentFailedEmail(params: {
  displayName: string;
  planName: string;
  amountFormatted: string;
  nextAttemptDate?: string;
  billingLink: string;
}): string {
  const { displayName, planName, amountFormatted, nextAttemptDate, billingLink } = params;
  const greeting = displayName ? `Hi ${escHtml(displayName)},` : "Hello,";

  const retryNote = nextAttemptDate
    ? `Stripe will automatically retry the payment on <strong>${escHtml(nextAttemptDate)}</strong>.`
    : "Stripe will automatically retry the payment shortly.";

  const body = `
    <h1 class="title">Action required: payment failed</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      We were unable to process your payment of <strong>${escHtml(amountFormatted)}</strong>
      for your <strong>${escHtml(planName)}</strong> subscription.
    </p>
    <div class="warning-box">
      <p>
        To keep your subscription active, please update your payment method.
        ${retryNote}
      </p>
    </div>
    <div class="cta-wrap">
      <a href="${escHtml(billingLink)}" class="cta-btn">Update Payment Method</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(billingLink)}">${escHtml(billingLink)}</a>
    </p>
    <hr class="divider" />
    <p class="text" style="font-size:13px;color:#718096;">
      Need help? Contact us at
      <a href="mailto:CarerView@grifdigi.com" style="color:#0d9488;">CarerView@grifdigi.com</a>.
    </p>`;

  return wrapEmail({
    previewText: `Action required: CarerView payment of ${amountFormatted} failed`,
    headerBadge: "Payment Alert",
    title: "Payment failed",
    bodyHtml: body,
  });
}

// ── Subscription cancelled ─────────────────────────────────────────────────────

export function buildSubscriptionCancelledEmail(params: {
  displayName: string;
  planName: string;
  accessUntil: string;
  dashboardLink: string;
}): string {
  const { displayName, planName, accessUntil, dashboardLink } = params;
  const greeting = displayName ? `Hi ${escHtml(displayName)},` : "Hello,";

  const body = `
    <h1 class="title">Your ${escHtml(planName)} subscription has been cancelled</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      Your <strong>${escHtml(planName)}</strong> subscription has been cancelled. You will retain
      access to your paid features until <strong>${escHtml(accessUntil)}</strong>.
    </p>
    <div class="highlight-box">
      <p>
        After ${escHtml(accessUntil)}, your account will revert to the free plan. Your data
        is retained and you can resubscribe at any time.
      </p>
    </div>
    <div class="cta-wrap">
      <a href="${escHtml(dashboardLink)}" class="cta-btn">Go to Your Dashboard</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(dashboardLink)}">${escHtml(dashboardLink)}</a>
    </p>
    <hr class="divider" />
    <p class="text" style="font-size:13px;color:#718096;">
      We're sorry to see you go. If you have feedback or need help, contact us at
      <a href="mailto:CarerView@grifdigi.com" style="color:#0d9488;">CarerView@grifdigi.com</a>.
    </p>`;

  return wrapEmail({
    previewText: `Your CarerView ${planName} subscription has been cancelled`,
    headerBadge: "Subscription",
    title: `${planName} subscription cancelled`,
    bodyHtml: body,
  });
}

// ── Trial ending reminder ──────────────────────────────────────────────────────

export function buildTrialEndingEmail(params: {
  displayName: string;
  planName: string;
  trialEndDate: string;
  upgradeLink: string;
}): string {
  const { displayName, planName, trialEndDate, upgradeLink } = params;
  const greeting = displayName ? `Hi ${escHtml(displayName)},` : "Hello,";

  const body = `
    <h1 class="title">Your CarerView trial ends ${escHtml(trialEndDate)}</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      Your <strong>${escHtml(planName)}</strong> trial is ending on <strong>${escHtml(trialEndDate)}</strong>.
      After that date, your account will revert to the free plan unless you add a payment method.
    </p>
    <div class="highlight-box">
      <p>
        Add your payment details before ${escHtml(trialEndDate)} to keep uninterrupted
        access to all ${escHtml(planName)} features.
      </p>
    </div>
    <div class="cta-wrap">
      <a href="${escHtml(upgradeLink)}" class="cta-btn">Continue My Subscription</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(upgradeLink)}">${escHtml(upgradeLink)}</a>
    </p>
    <hr class="divider" />
    <p class="text" style="font-size:13px;color:#718096;">
      Questions about plans? Contact us at
      <a href="mailto:CarerView@grifdigi.com" style="color:#0d9488;">CarerView@grifdigi.com</a>.
    </p>`;

  return wrapEmail({
    previewText: `Your CarerView trial ends ${trialEndDate} — keep access by adding a payment method`,
    headerBadge: "Trial Reminder",
    title: "Trial ending soon",
    bodyHtml: body,
  });
}

// ── Admin report alert (community moderation) ──────────────────────────────────

export function buildAdminReportAlertEmail(params: {
  reporterDisplayName: string;
  contentType: "post" | "reply";
  contentExcerpt: string;
  reason: string;
  moderationLink: string;
}): string {
  const { reporterDisplayName, contentType, contentExcerpt, reason, moderationLink } = params;

  const body = `
    <h1 class="title">New community report requires review</h1>
    <p class="text">
      A community ${escHtml(contentType)} has been reported and requires moderation review.
    </p>
    <div class="highlight-box">
      <p>
        <strong>Reported by:</strong> ${escHtml(reporterDisplayName)}<br />
        <strong>Content type:</strong> ${escHtml(contentType)}<br />
        <strong>Reason:</strong> ${escHtml(reason)}<br />
        <strong>Excerpt:</strong> "${escHtml(contentExcerpt)}"
      </p>
    </div>
    <div class="cta-wrap">
      <a href="${escHtml(moderationLink)}" class="cta-btn">Review in Moderation Queue</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(moderationLink)}">${escHtml(moderationLink)}</a>
    </p>`;

  return wrapEmail({
    previewText: `New community report: ${reason} — review required`,
    headerBadge: "Moderation Alert",
    title: "Community report requires review",
    bodyHtml: body,
  });
}

// ── Guest observation submitted notification (to team owner) ───────────────────

export function buildGuestObservationSubmittedEmail(params: {
  ownerName: string;
  guestName: string;
  guestEmail: string;
  residentName: string;
  formType: string;
  observationDate: string;
  dashboardLink: string;
}): string {
  const { ownerName, guestName, guestEmail, residentName, formType, observationDate, dashboardLink } = params;
  const greeting = ownerName ? `Hi ${escHtml(ownerName)},` : "Hello,";

  const formLabel =
    formType === "COMPREHENSIVE"
      ? "ADL + IADL"
      : formType === "ADL"
      ? "ADL"
      : "IADL";

  const body = `
    <h1 class="title">A guest observation has been submitted</h1>
    <p class="text">${greeting}</p>
    <p class="text">
      <strong>${escHtml(guestName)}</strong> (${escHtml(guestEmail)}) has submitted a
      <strong>${escHtml(formLabel)}</strong> observation for
      <strong>${escHtml(residentName)}</strong> dated <strong>${escHtml(observationDate)}</strong>.
    </p>
    <p class="text">You can review the full observation from your CarerView dashboard.</p>
    <div class="cta-wrap">
      <a href="${escHtml(dashboardLink)}" class="cta-btn">View Observation</a>
    </div>
    <p class="link-fallback">
      <a href="${escHtml(dashboardLink)}">${escHtml(dashboardLink)}</a>
    </p>`;

  return wrapEmail({
    previewText: `${guestName} submitted an observation for ${residentName}`,
    headerBadge: "New Observation",
    title: "Guest observation submitted",
    bodyHtml: body,
  });
}
