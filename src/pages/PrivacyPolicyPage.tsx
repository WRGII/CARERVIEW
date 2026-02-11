import { Link } from "react-router-dom";
import { Shield, Mail, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-gray/60 hover:text-cyan-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-gray/10 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-cyan-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-gray">
              Privacy Policy
            </h1>
          </div>

          <div className="space-y-8 text-slate-gray leading-relaxed">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
              <p className="text-amber-800 font-medium text-sm">
                This privacy policy is being finalised and will be published in
                full shortly. In the meantime, the summary below describes how
                CarerView handles your information. If you have any questions,
                please contact us.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                What We Collect
              </h2>
              <p>
                CarerView collects only the information necessary to provide our
                caregiving observation service: your email address, display name,
                and the observation data you choose to enter. Payment processing
                is handled entirely by Stripe; we do not store credit card
                numbers on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                How We Use Your Data
              </h2>
              <p>
                Your data is used solely to operate the CarerView service --
                storing observations, managing your account, and processing
                subscriptions. We do not sell, share, or monetise your personal
                information or observation data with third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Data Storage and Security
              </h2>
              <p>
                All data is stored securely in our database with row-level
                security policies ensuring that only you (and any team members
                you explicitly invite) can access your observations. Data is
                encrypted in transit using TLS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Your Rights
              </h2>
              <p>
                You can export your data at any time from within the application.
                You may also delete your account entirely, which permanently
                removes all associated data from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Cookies
              </h2>
              <p>
                CarerView uses only essential cookies required for
                authentication and session management. We do not use third-party
                tracking cookies or advertising cookies.
              </p>
            </section>

            <div className="pt-6 border-t border-slate-gray/10">
              <p className="text-sm text-slate-gray/60">
                Last updated: February 2026
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-cyan-primary" />
                <span className="text-slate-gray/70">Questions? Reach us at</span>
                <a
                  href="mailto:CarerView@GrifDigi.com"
                  className="text-cyan-primary hover:text-cyan-hover underline"
                >
                  CarerView@GrifDigi.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
