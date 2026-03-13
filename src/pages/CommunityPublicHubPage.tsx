import { Link } from 'react-router-dom'
import {
  Users, Heart, ArrowRight, MessageCircle, ShieldCheck,
  BookOpen, TrendingUp, Sparkles, ChevronDown,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { SITE_URL } from '../lib/siteConfig'
import type { CommunityRoom } from '../lib/community'
import PublicRoomSection from '../components/community/PublicRoomSection'
import PageSEO from '../components/seo/PageSEO'

const SIGNUP_URL = '/create-account?plan=free&source=caregiver-forum'

const COMMUNITY_FAQ = [
  {
    q: 'What is a caregiver support forum?',
    a: 'A caregiver support forum is an online community where family caregivers share experiences, ask questions, and find practical advice from others in similar situations. CarerView\'s community forum is free to join and covers topics including dementia care, caregiver burnout, elderly care at home, family coordination, and emotional wellbeing.',
  },
  {
    q: 'Is there a free online caregiver support group I can join?',
    a: 'Yes. CarerView\'s caregiver community is completely free to join. You get access to all discussion rooms covering dementia, ageing parents, caregiver burnout, self-care, and more. You can post anonymously if you prefer privacy. No credit card required.',
  },
  {
    q: 'How do caregivers cope with burnout?',
    a: 'Caregiver burnout is extremely common, particularly for those caring for a parent with dementia or a serious illness. Strategies that help include setting boundaries with siblings or other family members, asking for help before you reach exhaustion, joining a support group to share feelings, scheduling regular breaks (respite care), and tracking care tasks so you can show others what is actually involved.',
  },
  {
    q: 'How do I handle dementia aggression as a caregiver?',
    a: 'Dementia aggression and agitation can be one of the most distressing parts of caregiving. It often has a trigger — pain, fear, overstimulation, or a change in routine. Staying calm, speaking softly, reducing stimulation, and redirecting attention can help in the moment. Many caregivers share their specific experiences in our Dementia Care room, including what has and hasn\'t worked for them.',
  },
  {
    q: 'What do I do when my siblings are not helping with caregiving?',
    a: 'Unequal caregiving responsibilities among siblings is one of the most common causes of family conflict and caregiver resentment. It helps to have a direct, calm conversation about specific tasks, consider a family meeting facilitated by a care manager, and document what care actually involves so others can see the reality. Our community forum has an active Family Dynamics room where many caregivers discuss exactly this.',
  },
  {
    q: 'My elderly parent refuses to bathe — what should I do?',
    a: 'Resistance to personal hygiene is very common in older adults, especially those with dementia or cognitive decline. The resistance is often about loss of control, embarrassment, cold, or fear of falling. Approaches that help include offering choices (sponge bath vs shower), making the bathroom warmer and safer, using a same-gender helper, and keeping the routine consistent. Other caregivers share specific strategies in our Practical Care Tips room.',
  },
  {
    q: 'What is dementia wandering and how can caregivers manage it at night?',
    a: 'Dementia wandering at night is when a person with dementia gets up and moves around, often seeming confused or searching for something. It can be caused by disrupted sleep patterns, sundowning, restlessness, or unmet needs. Practical approaches include door alarms, motion sensor lights, regular daytime activity, limiting afternoon naps, and checking for pain or discomfort. Connecting with other caregivers who have navigated this is one of the most helpful things you can do.',
  },
  {
    q: 'How do I cope with the stress of caring for an elderly parent at home?',
    a: 'Caring for an elderly parent at home, especially alone, is one of the most demanding things a person can do. Stress management strategies include connecting with other caregivers who understand (like this community), keeping a care log so you have a record, asking a doctor for a formal care needs assessment, exploring respite care options, and being honest with yourself about how you are coping. You are not alone — thousands of caregivers face the same challenges daily.',
  },
  {
    q: 'Is CarerView\'s community forum for UK caregivers?',
    a: 'CarerView\'s caregiver forum welcomes caregivers from anywhere in the world. We have active members in the UK, Ireland, Australia, the US, and across Europe. The community is particularly active among those caring for ageing parents and those navigating dementia.',
  },
  {
    q: 'What is the difference between CarerView\'s free community and paid plans?',
    a: 'The community forum is always free — join once and access all discussion rooms, post and reply, and choose to post anonymously. Paid CarerView plans add structured observation tracking tools, the CarerView ADL/IADL scale for monitoring changes in your loved one over time, family team coordination, and healthcare-ready export reports.',
  },
]

function RoomSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
          <div>
            <div className="h-3.5 bg-slate-200 rounded w-32 mb-1.5" />
            <div className="h-2.5 bg-slate-100 rounded w-48" />
          </div>
        </div>
        <div className="h-3 bg-slate-100 rounded w-12" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="px-4 py-3.5 border-b border-slate-100 last:border-0">
          <div className="h-3.5 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-full mb-1" />
          <div className="h-3 bg-slate-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

interface InlineCTAProps {
  tone: 'peach' | 'mint'
  headline: string
  sub: string
}

function InlineCTA({ tone, headline, sub }: InlineCTAProps) {
  const bg = tone === 'peach'
    ? 'bg-rose-50 border-rose-100'
    : 'bg-teal-50 border-teal-100'
  const btnClass = tone === 'peach'
    ? 'bg-slate-800 hover:bg-slate-700 text-white'
    : 'bg-teal-600 hover:bg-teal-700 text-white'

  return (
    <div className={`rounded-2xl border px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-4 ${bg}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 leading-snug">{headline}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sub}</p>
      </div>
      <Link
        to={SIGNUP_URL}
        className={`inline-flex flex-col items-center px-4 py-2 text-sm font-semibold rounded-xl transition-colors flex-shrink-0 self-start sm:self-auto leading-tight ${btnClass}`}
      >
        <span>Share &amp; Learn</span>
        <span className="text-xs font-normal opacity-90">always free</span>
      </Link>
    </div>
  )
}

function TrustBar() {
  return (
    <div className="bg-slate-800 rounded-2xl">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            Moderated and safe
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            Anonymous posting available
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            Peer support, not medical advice
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            Free for all caregivers
          </span>
        </div>
      </div>
    </div>
  )
}

function CommunityFAQ() {
  return (
    <section aria-labelledby="faq-heading" className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100">
        <h2 id="faq-heading" className="text-lg font-bold text-slate-800">
          Caregiver support — frequently asked questions
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Answers to questions caregivers ask most often
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {COMMUNITY_FAQ.map((item, i) => (
          <details key={i} className="group px-6 sm:px-8 py-0 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 py-4">
              <h3 className="text-sm font-semibold text-slate-800 leading-snug">{item.q}</h3>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default function CommunityTopicHubPage() {
  const { data: rooms, isLoading: roomsLoading } = useQuery<CommunityRoom[]>({
    queryKey: ['public-community', 'rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_rooms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 120_000,
  })

  const { data: communityStats } = useQuery<{ member_count: number; post_count: number }>({
    queryKey: ['public-community', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_community_public_stats')
      if (error) throw error
      return data as { member_count: number; post_count: number }
    },
    staleTime: 120_000,
  })

  const memberCount = communityStats?.member_count
  const postCount = communityStats?.post_count

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: COMMUNITY_FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Caregiver Community Forum',
        item: `${SITE_URL}/caregiver-forum`,
      },
    ],
  }

  const discussionForumSchema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    name: 'CarerView Caregiver Community Forum',
    url: `${SITE_URL}/caregiver-forum`,
    description: 'A free online forum for family caregivers to share experiences, ask questions, and find support for dementia care, caregiver burnout, caring for ageing parents, and more.',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageSEO
        title="Free Caregiver Forum & Support Community - CarerView"
        description="Join CarerView's free caregiver support forum. Discuss dementia care, caregiver burnout, caring for ageing parents, sibling conflict, and more. Anonymous posting available. Free for all family caregivers."
        canonical={`${SITE_URL}/caregiver-forum`}
        ogImage={`${SITE_URL}/og-caregiver-forum.png`}
        structuredData={[faqStructuredData, breadcrumbStructuredData, discussionForumSchema]}
      />

      {/* Breadcrumb nav */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <ol className="flex items-center gap-1.5 text-xs text-slate-400">
            <li>
              <Link to="/" className="hover:text-slate-600 transition-colors">Home</Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li className="text-slate-600 font-medium">Caregiver Community Forum</li>
          </ol>
        </div>
      </nav>

      {/* Slim hero */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex flex-wrap gap-2 mb-3">
                <strong className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">Family Caregiver</strong>
                <strong className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">Dementia Support</strong>
                <strong className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">Caregiver Burnout</strong>
                <strong className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">Ageing Parents</strong>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-1">
                Free Caregiver Support Forum
              </h1>
              <p className="text-base text-slate-600 font-medium mb-1">
                Connect with caregivers who understand
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Share experiences, ask questions, and find practical wisdom — for dementia care, caregiver burnout, caring for ageing parents, and more.
              </p>

              {/* Live stats bar */}
              {(memberCount !== undefined || postCount !== undefined) && (
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  {memberCount !== undefined && memberCount > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                      <strong className="font-semibold text-slate-700">{memberCount.toLocaleString()}</strong>
                      {' '}caregivers in the community
                    </span>
                  )}
                  {postCount !== undefined && postCount > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MessageCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      <strong className="font-semibold text-slate-700">{postCount.toLocaleString()}</strong>
                      {' '}discussions
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                to={SIGNUP_URL}
                className="inline-flex flex-col items-center justify-center px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 leading-tight"
              >
                <span className="text-sm">Join the Community</span>
                <span className="text-xs font-normal opacity-90">always free</span>
              </Link>
              <Link
                to="/#get-started"
                className="inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                Already have an account? Sign in
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Forum feed */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">

        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Discussion rooms</h2>
            <p className="text-xs text-slate-400 mt-0.5">Browse what caregivers are talking about</p>
          </div>
        </div>

        {/* Semantic topic list for crawlers */}
        <ul className="sr-only">
          <li>Dementia Care &amp; Alzheimer's Support</li>
          <li>Caregiver Burnout &amp; Emotional Wellbeing</li>
          <li>Caring for Elderly Parents at Home</li>
          <li>Practical Care Tips &amp; Daily Challenges</li>
          <li>Family Dynamics &amp; Sibling Conflict in Caregiving</li>
          <li>Caregiver Self-Care &amp; Respite</li>
          <li>Medical Questions &amp; Healthcare Navigation</li>
          <li>Caregiver Discussion Board</li>
        </ul>

        {roomsLoading ? (
          <>
            <RoomSkeleton />
            <RoomSkeleton />
            <RoomSkeleton />
          </>
        ) : rooms && rooms.length > 0 ? (
          <>
            {rooms.map((room, index) => (
              <div key={room.id}>
                <PublicRoomSection room={room} useExamples />

                {index === 1 && (
                  <div className="mt-4">
                    <InlineCTA
                      tone="peach"
                      headline="Real support from caregivers who get it"
                      sub="Join free to reply, share what's working, and connect with others navigating the same challenges."
                    />
                  </div>
                )}

                {index === 4 && (
                  <div className="mt-4">
                    <InlineCTA
                      tone="mint"
                      headline="Ask anonymously, find your people"
                      sub="Post without sharing your name when you need to — your privacy is protected."
                    />
                  </div>
                )}

                {index === 7 && (
                  <div className="mt-4">
                    <InlineCTA
                      tone="peach"
                      headline="You don't have to figure this out alone"
                      sub="Thousands of caregivers share practical wisdom and emotional support here every day. Join them — free."
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Trust bar — dark, after discussion rooms */}
            <TrustBar />

            {/* FAQ section with JSON-LD */}
            <CommunityFAQ />

            {/* End of page CTA */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center mt-2">
              <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-cyan-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1.5">
                Ready to connect with other caregivers?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-4">
                Join free to reply, post your own questions, and be part of a caregiver community that truly understands.
              </p>
              <Link
                to={SIGNUP_URL}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Join Caregiver Community — Free
              </Link>
              <p className="text-xs text-slate-400 mt-2">Free for all registered CarerView users</p>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No rooms yet</p>
            <p className="text-xs text-slate-400">Community rooms are coming soon.</p>
          </div>
        )}

        {/* Why CarerView bridge section */}
        <section aria-labelledby="tools-heading" className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-slate-100">
            <h2 id="tools-heading" className="text-xl font-bold text-slate-800 mb-2">
              Need more than peer support?
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
              Community is great for connection and shared wisdom. When you need structured care tracking — for yourself, your care recipient, or your team — CarerView's observation tools go deeper.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              {
                icon: BookOpen,
                title: 'Observation logs',
                body: 'Record daily care notes with structured categories and track how things change week to week.',
              },
              {
                icon: TrendingUp,
                title: 'Track changes over time',
                body: 'See patterns across days and weeks. Share reports with healthcare providers when needed.',
              },
              {
                icon: Users,
                title: 'Coordinate your care team',
                body: 'Invite family members or professional carers to a shared care view. Everyone stays aligned.',
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="px-6 py-6 flex flex-col gap-3">
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-6 sm:px-8 py-5 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Community is always free. Observation and team features are part of paid CarerView plans.
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
              >
                See what's included in each plan
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/why"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
              >
                Learn about observation tools
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
