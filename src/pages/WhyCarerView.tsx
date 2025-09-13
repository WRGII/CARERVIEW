// src/pages/WhyCarerView.tsx
import React from "react";

export default function WhyCarerView() {
  // Removed: "Siblings & cousins caring for Auntie"
  const personas = [
    {
      title: "Long-distance family coordination",
      quote:
        "“I’m out of town. I hated feeling out of the loop. CarerView lets me check the latest observations before I call.”",
      bullets: [
        "See updates in one place—no more hunting for info.",
        "Review trends to prep for phone calls and visits.",
        "Share only what each person needs to see.",
      ],
    },
    {
      title: "Sandwich-generation caregiver",
      quote:
        "“Between my kids and Mum’s appointments, I forget details. CarerView captures patterns so I bring clear notes to the doctor.”",
      bullets: [
        "Capture incidents and routines as they happen.",
        "Create clinic-ready summaries from real-life notes.",
        "Make calmer decisions with shared context.",
      ],
    },
    {
      title: "Rotating helpers / paid caregivers",
      quote:
        "“We needed smooth hand-offs. With CarerView, every shift sees what changed and what works.”",
      bullets: [
        "Keep a living playbook of triggers and what helps.",
        "Track who did what for clear accountability.",
        "Reduce repeat questions and missed details.",
      ],
    },
    {
      title: "Hospital-to-home transitions",
      quote:
        "“Discharge instructions felt overwhelming. CarerView helped us monitor the first weeks and escalate with evidence.”",
      bullets: [
        "Log observations aligned to the care plan.",
        "Highlight concerning trends early.",
        "Share concise updates with clinicians.",
      ],
    },
  ];

  return (
    <div className="bg-warm-white">
      {/* Header/Outlet come from MainLayout; this page just renders content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-gray">Why CarerView</h1>
          <p className="mt-3 text-slate-gray/75">
            CarerView gives families and care teams a simple, shared way to notice changes, align
            decisions, and keep everyone on the same page—without adding work.
          </p>
        </div>
      </section>

      {/* Persona cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid gap-6 sm:grid-cols-2 items-stretch">
          {personas.map((p) => (
            <article
              key={p.title}
              className="h-full rounded-2xl border border-slate-gray/20 bg-white shadow-sm hover:shadow-md transition-shadow"
              aria-label={p.title}
            >
              <div className="p-6 h-full flex flex-col">
                <h2 className="text-lg font-semibold text-slate-gray">{p.title}</h2>
                <p className="mt-3 text-slate-gray/80 italic">{p.quote}</p>

                {/* flex-1 keeps bullets filling available space for even heights */}
                <ul className="mt-4 space-y-2 text-slate-gray/80 flex-1">
                  {p.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-peach-blush/70" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA: placeholder stays for now; we'll replace with the full auth form in Step 2 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-slate-gray/20 bg-white shadow-sm">
            <div className="px-6 py-5 border-b border-slate-gray/10">
              <h3 className="text-xl font-semibold text-slate-gray">Bring calm to the conversation</h3>
              <p className="mt-1 text-slate-gray/70 text-sm">
                Start noticing together, decide together, and care together—with CarerView as your shared
                compass.
              </p>
            </div>
            <div className="p-6">
              <p className="text-slate-gray/70 text-sm">
                {/* This is temporary; we'll wire the real form in the next step */}
                Place your existing <strong>Create account / Sign in</strong> form component here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
