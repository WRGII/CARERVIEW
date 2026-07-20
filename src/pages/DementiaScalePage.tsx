import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../i18n/LocaleContext';
import { PageLayout } from '../components/layout/PageLayout';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import Breadcrumbs from '../components/common/Breadcrumbs';

type Stage = {
  number: number;
  diagnosis: string;
  diagnosisColor: string;
  diagnosisBg: string;
  name: string;
  symptoms: string[];
  duration: string | null;
  stageColor: string;
  stageBg: string;
  stageBorder: string;
  stageNumberBg: string;
  stageNumberText: string;
};

const stages: Stage[] = [
  {
    number: 1,
    diagnosis: 'No Dementia',
    diagnosisColor: 'text-emerald-700',
    diagnosisBg: 'bg-emerald-50',
    name: 'No Cognitive Decline',
    symptoms: [
      'Normal function',
      'No memory loss',
      'People with NO dementia are considered in Stage 1',
    ],
    duration: null,
    stageColor: 'text-emerald-800',
    stageBg: 'bg-emerald-50',
    stageBorder: 'border-emerald-200',
    stageNumberBg: 'bg-emerald-500',
    stageNumberText: 'text-white',
  },
  {
    number: 2,
    diagnosis: 'No Dementia',
    diagnosisColor: 'text-teal-700',
    diagnosisBg: 'bg-teal-50',
    name: 'Very Mild Cognitive Decline',
    symptoms: [
      'Forgets names',
      'Misplaces familiar objects',
      'Symptoms not evident to loved ones or doctors',
    ],
    duration: 'Duration is currently unknown.',
    stageColor: 'text-teal-800',
    stageBg: 'bg-teal-50',
    stageBorder: 'border-teal-200',
    stageNumberBg: 'bg-teal-500',
    stageNumberText: 'text-white',
  },
  {
    number: 3,
    diagnosis: 'No Dementia',
    diagnosisColor: 'text-cyan-700',
    diagnosisBg: 'bg-cyan-50',
    name: 'Mild Cognitive Decline',
    symptoms: [
      'Increased forgetfulness',
      'Slight difficulty concentrating',
      'Decreased work performance',
      'Gets lost more frequently',
      'Difficulty finding right words',
      'Loved ones begin to notice',
    ],
    duration: 'Average duration is between 2 and 7 years.',
    stageColor: 'text-cyan-800',
    stageBg: 'bg-cyan-50',
    stageBorder: 'border-cyan-200',
    stageNumberBg: 'bg-cyan-primary',
    stageNumberText: 'text-white',
  },
  {
    number: 4,
    diagnosis: 'Early-Stage Dementia',
    diagnosisColor: 'text-amber-700',
    diagnosisBg: 'bg-amber-50',
    name: 'Moderate Cognitive Decline',
    symptoms: [
      'Difficulty concentrating',
      'Forgets recent events',
      'Cannot manage finances',
      'Cannot travel alone to new places',
      'Difficulty completing tasks',
      'In denial about symptoms',
      'Withdraws from friends or family',
      'Physician can detect cognitive problems',
    ],
    duration: 'Average duration is 2 years.',
    stageColor: 'text-amber-800',
    stageBg: 'bg-amber-50',
    stageBorder: 'border-amber-200',
    stageNumberBg: 'bg-amber-500',
    stageNumberText: 'text-white',
  },
  {
    number: 5,
    diagnosis: 'Mid-Stage Dementia',
    diagnosisColor: 'text-orange-700',
    diagnosisBg: 'bg-orange-50',
    name: 'Moderately Severe Cognitive Decline',
    symptoms: [
      'Major memory deficiencies',
      'Needs assistance with Activities of Daily Living (mobility, bathing, dressing, eating, toileting)',
      'Forgets details like address or phone number',
      "Doesn't know time or date",
      "Doesn't know where they are",
    ],
    duration: 'Average duration is 1.5 years.',
    stageColor: 'text-orange-800',
    stageBg: 'bg-orange-50',
    stageBorder: 'border-orange-200',
    stageNumberBg: 'bg-orange-500',
    stageNumberText: 'text-white',
  },
  {
    number: 6,
    diagnosis: 'Mid-Stage Dementia',
    diagnosisColor: 'text-rose-700',
    diagnosisBg: 'bg-rose-50',
    name: 'Severe Cognitive Decline',
    symptoms: [
      'Cannot carry out Activities of Daily Living (ADLs) without help',
      'Forgets names of family members',
      'Forgets recent and major past events',
      'Difficulty counting down from 10',
      'Incontinence (loss of bladder control)',
      'Difficulty speaking',
      'Personality and emotional changes',
      'Delusions, compulsions, and anxiety',
    ],
    duration: 'Average duration is 2.5 years.',
    stageColor: 'text-rose-800',
    stageBg: 'bg-rose-50',
    stageBorder: 'border-rose-200',
    stageNumberBg: 'bg-rose-500',
    stageNumberText: 'text-white',
  },
  {
    number: 7,
    diagnosis: 'Late-Stage Dementia',
    diagnosisColor: 'text-red-700',
    diagnosisBg: 'bg-red-50',
    name: 'Very Severe Cognitive Decline',
    symptoms: [
      'Cannot speak or communicate',
      'Requires help with most activities',
      'Loss of motor skills',
      'Cannot walk',
    ],
    duration: 'Average duration is 1.5 to 2.5 years.',
    stageColor: 'text-red-800',
    stageBg: 'bg-red-50',
    stageBorder: 'border-red-200',
    stageNumberBg: 'bg-red-500',
    stageNumberText: 'text-white',
  },
];

function StageCard({ stage }: { stage: Stage }) {
  const [expanded, setExpanded] = useState(true);
  const { t } = useLocale();

  return (
    <div
      className={`rounded-2xl border-2 ${stage.stageBorder} ${stage.stageBg} overflow-hidden transition-all duration-200 hover:shadow-md`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-6 py-5 flex items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-primary focus-visible:ring-offset-2 rounded-2xl"
        aria-expanded={expanded}
      >
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-xl ${stage.stageNumberBg} ${stage.stageNumberText} flex items-center justify-center text-lg font-bold shadow-sm`}
        >
          {stage.number}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stage.diagnosisBg} ${stage.diagnosisColor} border border-current/20`}
            >
              {stage.diagnosis}
            </span>
          </div>
          <h3 className={`text-lg font-bold ${stage.stageColor} leading-snug`}>
            Stage {stage.number}: {stage.name}
          </h3>
        </div>

        <div className={`flex-shrink-0 ${stage.stageColor} opacity-60`}>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="h-px bg-current opacity-10 mx-0" style={{ color: 'inherit' }} />

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className={`text-sm font-semibold ${stage.stageColor} uppercase tracking-wide mb-3`}>
                {t('dementia.signs_symptoms')}
              </h4>
              <ul className="space-y-2">
                {stage.symptoms.map((symptom, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${stage.stageNumberBg}`}
                    />
                    <span className={`text-sm leading-relaxed ${stage.stageColor} opacity-90`}>
                      {symptom}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className={`text-sm font-semibold ${stage.stageColor} uppercase tracking-wide mb-3`}>
                {t('dementia.expected_duration')}
              </h4>
              <p className={`text-sm leading-relaxed ${stage.stageColor} opacity-90`}>
                {stage.duration ?? t('dementia.not_applicable')}
              </p>

              {stage.number >= 4 && (
                <div className={`mt-4 p-3 rounded-xl bg-white/60 border ${stage.stageBorder}`}>
                  <p className={`text-xs font-medium ${stage.stageColor} opacity-80`}>
                    {stage.number === 4 && t('dementia.note_4')}
                    {stage.number === 5 && t('dementia.note_5')}
                    {stage.number === 6 && t('dementia.note_6')}
                    {stage.number === 7 && t('dementia.note_7')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DementiaScalePage() {
  const { user, profile, loading, error } = useAuth();
  const { t } = useLocale();

  if (loading) return <Loading message={t('common.loading')} />;
  if (error || !user) return <ErrorMessage message={error || t('common.auth_required')} />;
  if (!profile) return <ErrorMessage message={t('common.profile_not_found')} />;

  return (
    <PageLayout
      title={t('dementia.page_title')}
      subtitle={t('dementia.subtitle')}
      user={{ ...user, profile }}
      hideSignOut={true}
      headerRight={
        <Link
          to="/caregiver"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('caregiver.dashboard_title')}
        </Link>
      }
    >
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: t('dementia.page_title') }]} />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-cyan-primary/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-cyan-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-700">
                {t('dementia.about_title')}
              </h2>
              <div className="text-slate-600 leading-relaxed space-y-2 text-sm md:text-base">
                <p>
                  {t('dementia.about_p1')}
                </p>
                <p>
                  {t('dementia.about_p2')}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                {[
                  { label: t('dementia.stages_13'), desc: t('dementia.stages_13_desc'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { label: t('dementia.stage_4'), desc: t('dementia.stage_4_desc'), color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { label: t('dementia.stages_56'), desc: t('dementia.stages_56_desc'), color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: t('dementia.stage_7'), desc: t('dementia.stage_7_desc'), color: 'bg-red-50 text-red-700 border-red-200' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${item.color}`}
                  >
                    <span className="font-bold">{item.label}:</span>
                    <span>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">{t('dementia.seven_stages')}</h2>
          <div className="space-y-3">
            {stages.map((stage) => (
              <StageCard key={stage.number} stage={stage} />
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-600">{t('dementia.disclaimer_label')}</strong> {t('dementia.disclaimer_body')}
          </p>
          <p className="mt-4 text-sm text-slate-600">
            <Link to="/resources" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.caregiver_resources')}</Link>
            {' · '}
            <Link to="/why" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.why_carerview')}</Link>
            {' · '}
            <Link to="/new-carer" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.new_carer')}</Link>
            {' · '}
            <Link to="/community" className="text-cyan-700 hover:text-cyan-800 underline font-medium">{t('nav.caregiver_forum')}</Link>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
