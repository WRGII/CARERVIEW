import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, PenLine, EyeOff, Eye, CircleAlert as AlertCircle, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useCommunityRoom } from '../hooks/useCommunityRooms'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import { useCreatePost } from '../hooks/useCommunityPosts'
import { Button } from '../components/ui/Button'
import type { HelpType } from '../lib/community'
import { useLocale } from '../i18n/LocaleContext'

const HELP_TYPE_EMOJIS: Record<HelpType, string> = {
  emotional_support: '💛',
  practical_tips: '🔧',
  similar_experiences: '🤝',
  question: '❓',
  resource: '📚',
}

const HELP_TYPE_VALUES: HelpType[] = [
  'emotional_support',
  'practical_tips',
  'similar_experiences',
  'question',
  'resource',
]

export default function CommunityNewPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: room, isLoading: roomLoading } = useCommunityRoom(slug)
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const createPost = useCreatePost()
  const { t } = useLocale()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [helpType, setHelpType] = useState<HelpType | ''>('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; body?: string; helpType?: string }>({})

  if (!profileLoading && !profile) {
    return <Navigate to="/community" replace />
  }

  if (!profileLoading && profile?.is_banned) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">Posting restricted</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Your account has been restricted from posting in the community.
            If you believe this is an error, please contact support.
          </p>
          <Link to={`/community/rooms/${slug}`}>
            <Button variant="outline" size="sm">Go back</Button>
          </Link>
        </div>
      </div>
    )
  }

  const validate = () => {
    const e: typeof errors = {}
    if (title.trim().length < 5) e.title = 'Title must be at least 5 characters'
    if (title.trim().length > 200) e.title = 'Title must be 200 characters or fewer'
    if (body.trim().length < 10) e.body = 'Post must be at least 10 characters'
    if (body.trim().length > 5000) e.body = 'Post must be 5,000 characters or fewer'
    if (!helpType) e.helpType = 'Please select what kind of support you are looking for'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    if (!room) return

    try {
      const post = await createPost.mutateAsync({
        room_id: room.id,
        title: title.trim(),
        body: body.trim(),
        is_anonymous: isAnonymous,
        help_type: helpType || null,
      })
      navigate(`/community/posts/${post.id}`)
    } catch {
      // error displayed via createPost.error
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <Link
          to={`/community/rooms/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {roomLoading ? 'Back' : `Back to ${room?.name ?? 'room'}`}
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <PenLine className="w-5 h-5 text-cyan-600" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-slate-800">New Post</h1>
          </div>
          {room && (
            <p className="text-slate-500 text-sm">
              Posting in <span className="font-medium text-slate-700">{room.name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="New post form">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">

            {/* Title */}
            <div>
              <label htmlFor="post-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Title <span className="text-red-400" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="post-title"
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })) }}
                placeholder="What's your question or topic?"
                maxLength={200}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                }`}
                aria-describedby={errors.title ? 'title-error' : undefined}
                aria-invalid={!!errors.title}
                aria-required="true"
              />
              <div className="flex justify-between items-center mt-1.5">
                {errors.title
                  ? <p id="title-error" role="alert" className="text-sm text-red-600">{errors.title}</p>
                  : <span />
                }
                <span className={`text-xs ml-auto ${title.length > 180 ? 'text-amber-500' : 'text-slate-400'}`} aria-live="polite">
                  {title.length}/200
                </span>
              </div>
            </div>

            {/* Help type */}
            <div>
              <fieldset>
                <legend className="block text-sm font-semibold text-slate-700 mb-2">
                  What kind of support are you looking for?{' '}
                  <span className="text-red-400" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </legend>
                {errors.helpType && (
                  <p role="alert" className="text-sm text-red-600 mb-2">{errors.helpType}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {HELP_TYPE_VALUES.map(value => (
                    <label
                      key={value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        helpType === value
                          ? 'border-cyan-300 bg-cyan-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="helpType"
                        value={value}
                        checked={helpType === value}
                        onChange={() => { setHelpType(value); setErrors(prev => ({ ...prev, helpType: undefined })) }}
                        className="sr-only"
                      />
                      <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{HELP_TYPE_EMOJIS[value]}</span>
                      <div>
                        <p className={`text-sm font-medium ${helpType === value ? 'text-cyan-700' : 'text-slate-700'}`}>
                          {t(`community.help_type.${value}`)}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t(`community.help_type_desc.${value}`)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Body */}
            <div>
              <label htmlFor="post-body" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Your post <span className="text-red-400" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <textarea
                id="post-body"
                value={body}
                onChange={e => { setBody(e.target.value); setErrors(prev => ({ ...prev, body: undefined })) }}
                placeholder="Share your experience, question, or thoughts. Remember: please don't include identifying details about the person in your care."
                rows={8}
                maxLength={5000}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base resize-none leading-relaxed transition-colors ${
                  errors.body ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                }`}
                aria-describedby={errors.body ? 'body-error' : undefined}
                aria-invalid={!!errors.body}
                aria-required="true"
              />
              <div className="flex justify-between items-center mt-1.5">
                {errors.body
                  ? <p id="body-error" role="alert" className="text-sm text-red-600">{errors.body}</p>
                  : <span />
                }
                <span className={`text-xs ml-auto ${body.length > 4500 ? 'text-amber-500' : 'text-slate-400'}`} aria-live="polite">
                  {body.length}/5000
                </span>
              </div>
            </div>

            {/* Anonymous toggle — proper switch semantics */}
            <div>
              <button
                type="button"
                role="switch"
                aria-checked={isAnonymous}
                onClick={() => setIsAnonymous(prev => !prev)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  isAnonymous
                    ? 'border-slate-300 bg-slate-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isAnonymous
                    ? <EyeOff className="w-5 h-5 text-slate-600" aria-hidden="true" />
                    : <Eye className="w-5 h-5 text-slate-400" aria-hidden="true" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">
                    {isAnonymous ? 'Posting anonymously' : 'Post anonymously'}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                    {isAnonymous
                      ? 'Your handle will not be shown to other users. Your identity is still recorded internally for moderation.'
                      : 'Your community handle will be shown. Toggle to hide it from other users.'
                    }
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0 mt-0.5" aria-hidden="true">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-slate-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isAnonymous ? 'left-5' : 'left-1'}`} />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Privacy reminder */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4" role="note">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-700 leading-relaxed">
              <strong className="font-semibold">Privacy reminder:</strong> Please do not share the full name, location, or specific medical details of the person you care for.
            </p>
          </div>

          {createPost.error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700">
                {(createPost.error as any)?.message ?? 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Link to={`/community/rooms/${slug}`} className="flex-1">
              <Button variant="outline" size="lg" className="w-full" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="flex-1"
              disabled={createPost.isPending || roomLoading}
            >
              {createPost.isPending ? 'Posting…' : 'Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
