// src/pages/WhyPage.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function WhyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-gray">
            Why you need CarerView
          </h1>
          <p className="mt-3 max-w-3xl text-slate-gray/80">
            Observing the changes in someone you love can be stressful. CarerView gives you a
            simple way to observe and share what’s getting easier, what’s getting harder, and
            how things shift day-to-day—so everyone on the care team talks using the same
            barometer.
          </p>
        </header>

        {/* You can expand with cards/illustrations later */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-gray/20 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-gray">Simple daily notes</h3>
            <p className="mt-2 text-sm text-slate-gray/75">
              Log quick observations in plain language—no clinical jargon required.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-gray/20 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-gray">Shared understanding</h3>
            <p className="mt-2 text-sm text-slate-gray/75">
              Keep family and clinicians aligned with the same set of updates.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-gray/20 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-gray">Spot trends early</h3>
            <p className="mt-2 text-sm text-slate-gray/75">
              See what’s easing up or getting harder so you can act sooner.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/create-account"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-primary px-5 py-3 text-base font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all"
          >
            Get started
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-gray/30 bg-white px-5 py-3 text-base font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
