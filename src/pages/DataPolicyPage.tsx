import { Link } from "react-router-dom";
import { Database, Mail, ArrowLeft } from "lucide-react";

export default function DataPolicyPage() {
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
              <Database className="w-5 h-5 text-cyan-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-gray">
              Data Policy
            </h1>
          </div>

          <div className="space-y-8 text-slate-gray leading-relaxed">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-6">
              <p className="text-amber-800 font-medium text-sm">
                This data policy is being finalised and will be published in
                full shortly. Below is a summary of how CarerView manages
                caregiving data. If you have any questions, please contact us.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Data You Create
              </h2>
              <p>
                Observation records, scores, and notes you enter into CarerView
                belong to you. If you are part of a family care team, shared
                observations are visible to all active members of that team as
                configured by the team owner.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Data Sharing
              </h2>
              <p>
                CarerView does not share your caregiving data with any third
                party. Your observations are never used for advertising,
                research, or any purpose beyond providing the service to you and
                your care team.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Data Retention
              </h2>
              <p>
                Your data is retained for as long as your account is active.
                When you delete your account, all associated observations,
                responses, and personal information are permanently removed from
                our systems. This action is irreversible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Data Export
              </h2>
              <p>
                You can export your observation data at any time using the export
                feature in the application. Exports are available in standard
                formats so you can keep a personal copy of your records.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">
                Health Information Disclaimer
              </h2>
              <p>
                CarerView is a caregiving observation tool, not a medical device
                or health record system. The observations and scores recorded are
                intended to help families track patterns and communicate with
                care professionals -- they are not medical diagnoses or clinical
                assessments.
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
