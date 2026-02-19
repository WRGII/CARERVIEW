import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="h-5 w-5 flex-none text-cyan-600" aria-hidden />
      <span className="text-sm leading-6 text-slate-700">{children}</span>
    </li>
  );
}

const faqs = [
  {
    q: "Why quarterly billing?",
    a: "Quarterly billing reduces charge fatigue while supporting a simple weekly rhythm for Observations. Your next charge date is shown at checkout.",
  },
  {
    q: "What happens if we hit the Observation cap?",
    a: "You keep all history. Caps just encourage a steady, realistic pace. You can change plans later if you need more.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade between Free, Primary, and Family Circle. Changes take effect on the next billing date.",
  },
  {
    q: "Do Free Observers see everything?",
    a: "Observers can view family updates and make up to 3 notes per year. The Primary caregiver controls invites and visibility.",
  },
  {
    q: "What if my family needs more than 3 caregivers?",
    a: "Family Circle supports up to 3 caregivers. Larger families often add a second Family Circle plan.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-700">
            Simple Plans for Better Caregiving
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            One caregiver or many, you’ll have a clear record of what’s changing—so conversations start from facts, not fuzzy memories.
          </p>
          <p className="mt-2 text-sm italic text-slate-500">
            “Less second-guessing. More peace of mind.”
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Observer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">Free Observer</h2>
            <p className="mt-1 text-sm text-slate-500">Always free</p>
            <p className="mt-4 text-sm text-slate-600">
              Make a note when you visit. Stay connected—free forever.
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>3 Observations per year</Feature>
              <Feature>Join by invite from a caregiver</Feature>
              <Feature>Read updates in the family timeline</Feature>
            </ul>
            <div className="mt-6">
              <Link
                to="/create-account"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Primary Caregiver (Recommended) */}
          <div className="relative rounded-2xl border border-cyan-300 bg-cyan-50 p-6 shadow-md ring-1 ring-inset ring-cyan-200">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold text-white">
              Recommended
            </div>
            <h2 className="text-lg font-semibold text-slate-700">Primary Caregiver</h2>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">$12.50</span> per quarter{" "}
              <span className="text-slate-500">(&lt; $1/week)</span>
            </p>
            <p className="mt-4 text-sm text-slate-700">
              One caregiver, one clear record. 30 Observations a year keep trends visible and care plans on track.
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>30 Observations per year (≈ one per week)</Feature>
              <Feature>Single caregiver seat</Feature>
              <Feature>Trend reports & PDF summaries</Feature>
              <Feature>Email reminders & streak support</Feature>
            </ul>
            <div className="mt-6">
              <Link
                to="/create-account?plan=primary"
                className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                Choose Primary
              </Link>
              <p className="mt-2 text-center text-xs text-slate-500">
                Billed every 3 months. Next charge date shown at checkout.
              </p>
            </div>
          </div>

          {/* Family Circle */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-700">Family Circle</h2>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">$25.50</span> per quarter{" "}
              <span className="text-slate-500">(&lt; $9/month)</span>
            </p>
            <p className="mt-4 text-sm text-slate-600">
              Everyone’s notes, one shared story. Up to 3 caregivers collaborate without friction.
            </p>
            <ul className="mt-6 space-y-2">
              <Feature>Up to 3 caregivers</Feature>
              <Feature>100 Observations per year (shared)</Feature>
              <Feature>Shared weekly digest & reminders</Feature>
              <Feature>33% savings vs three Primary plans</Feature>
            </ul>
            <div className="mt-6">
              <Link
                to="/create-account?plan=family"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Choose Family Circle
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <h3 className="text-xl font-semibold text-slate-700">Questions & Answers</h3>
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((f, i) => (
            <details key={i} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{f.q}</span>
                <ChevronDown className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/create-account"
            className="inline-flex items-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Begin Observations Now
          </Link>
        </div>
      </section>
    </main>
  );
}
