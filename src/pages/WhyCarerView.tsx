// src/pages/WhyCarerView.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Users, FileText, ArrowRight, CircleCheck as CheckCircle, Clock } from "lucide-react";
import ObservationPreview from "../components/ObservationPreview";
import { Card, CardContent } from "../components/ui/Card";
import AuthForm from "../components/common/AuthForm";
import { useLocale } from "../i18n/LocaleContext";

export default function WhyCarerView() {
  const { t } = useLocale();

  const personas = [
    {
      title: t('why.persona1_title'),
      quote: t('why.persona1_quote'),
      bullets: [t('why.persona1_b1'), t('why.persona1_b2'), t('why.persona1_b3')],
    },
    {
      title: t('why.persona2_title'),
      quote: t('why.persona2_quote'),
      bullets: [t('why.persona2_b1'), t('why.persona2_b2'), t('why.persona2_b3')],
    },
    {
      title: t('why.persona3_title'),
      quote: t('why.persona3_quote'),
      bullets: [t('why.persona3_b1'), t('why.persona3_b2'), t('why.persona3_b3')],
    },
    {
      title: t('why.persona4_title'),
      quote: t('why.persona4_quote'),
      bullets: [t('why.persona4_b1'), t('why.persona4_b2'), t('why.persona4_b3')],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <div className="pt-8 pb-10 text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-gray">
              {t('why.hero_title')}
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-slate-gray/80 max-w-4xl mx-auto leading-relaxed">
            {t('why.hero_body')}
          </p>
        </div>

        {/* WHAT YOU'LL TRACK */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">
              {t('why.track_title')}
            </h3>
            <p className="text-xl text-slate-gray/80 max-w-3xl mx-auto">
              {t('why.track_body')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-gray mb-6 text-center">
                  {t('why.adl_title')}
                </h4>
                <BulletList
                  bullets={[
                    t('why.adl_1'), t('why.adl_2'), t('why.adl_3'),
                    t('why.adl_4'), t('why.adl_5'), t('why.adl_6'),
                  ]}
                  dot="cyan"
                />
                <ObservationPreview
                  questionText={t('why.adl_1')}
                  selectedScore={4}
                  accentColor="cyan"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-warm-white">
              <CardContent className="p-8">
                <h4 className="text-2xl font-semibold text-slate-gray mb-6 text-center">
                  {t('why.iadl_title')}
                </h4>
                <BulletList
                  bullets={[
                    t('why.iadl_1'), t('why.iadl_2'), t('why.iadl_3'),
                    t('why.iadl_4'), t('why.iadl_5'), t('why.iadl_6'),
                  ]}
                  dot="mint"
                />
                <ObservationPreview
                  questionText={t('why.iadl_1')}
                  selectedScore={4}
                  accentColor="mint"
                />
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-slate-gray/60 mt-8 italic">
            {t('why.custom_note')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-account"
              className="inline-flex items-center gap-3 rounded-xl bg-cyan-primary px-8 py-4 text-lg font-semibold text-warm-white shadow-lg hover:bg-cyan-hover transition-all duration-200 hover:shadow-xl"
            >
              {t('why.cta_begin')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to={{ pathname: "/", hash: "#get-started" }}
              className="inline-flex items-center gap-3 rounded-xl border-2 border-slate-gray/30 px-8 py-4 text-lg font-semibold text-slate-gray hover:bg-peach-blush/20 transition-all duration-200"
              aria-label={t('why.cta_signin')}
            >
              {t('why.cta_signin')}
            </Link>
          </div>
        </div>

        {/* PERSONAS */}
        <section className="pb-12">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-slate-gray">
              {t('why.personas_title')}
            </h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 items-stretch">
            {personas.map((p) => (
              <article
                key={p.title}
                className="h-full rounded-2xl border border-slate-gray/20 bg-white shadow-sm hover:shadow-md transition-shadow"
                aria-label={p.title}
              >
                <div className="p-6 h-full flex flex-col">
                  <h4 className="text-lg font-semibold text-slate-gray">{p.title}</h4>
                  <p className="mt-3 text-slate-gray/80 italic">{p.quote}</p>
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

        {/* HOW CARERVIEW HELPS */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-gray mb-6">
              {t('why.shared_lang_title')}
            </h3>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">{t('why.how1_title')}</h4>
                <p className="text-slate-gray/80 leading-relaxed">{t('why.how1_body')}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-mint-green/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">{t('why.how2_title')}</h4>
                <p className="text-slate-gray/80 leading-relaxed">{t('why.how2_body')}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-peach-blush/60 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-slate-gray" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">{t('why.how3_title')}</h4>
                <p className="text-slate-gray/80 leading-relaxed">{t('why.how3_body')}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-warm-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-cyan-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-cyan-primary" />
                </div>
                <h4 className="text-xl font-semibold text-slate-gray mb-4">{t('why.how4_title')}</h4>
                <p className="text-slate-gray/80 leading-relaxed">{t('why.how4_body')}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* GET STARTED FORM */}
        <section className="pb-24">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-bold text-slate-gray mb-4">
                {t('why.cta_trend_title')}
              </h3>
              <p className="text-lg text-slate-gray/75 leading-relaxed">
                {t('why.cta_trend_body')}
              </p>
            </div>
            <AuthForm initialMode="signup" showToggle={true} />
          </div>
        </section>
      </div>
    </div>
  );
}

function BulletList({ bullets, dot }: { bullets: string[]; dot: "cyan" | "mint" }) {
  const dotClass = dot === "mint" ? "bg-mint-green" : "bg-cyan-primary";
  return (
    <div className="space-y-3">
      {bullets.map((item, idx) => (
        <div key={idx} className="flex items-center space-x-3">
          <div className={`w-2 h-2 ${dotClass} rounded-full`} />
          <span className="text-slate-gray">{item}</span>
        </div>
      ))}
    </div>
  );
}
