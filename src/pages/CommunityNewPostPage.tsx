import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, PenLine, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useCommunityRoom } from '../hooks/useCommunityRooms'
import { useMyCommunityProfile } from '../hooks/useCommunityProfile'
import { useCreatePost } from '../hooks/useCommunityPosts'
import { Button } from '../components/ui/Button'

export default function CommunityNewPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: room, isLoading: roomLoading } = useCommunityRoom(slug)
  const { data: profile, isLoading: profileLoading } = useMyCommunityProfile()
  const createPost = useCreatePost()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({})

  if (!profileLoading && !profile) {
    return <Navigate to="/community" replace />
  }

  const validate = () => {
    const e: { title?: string; body?: string } = {}
    if (title.trim().length < 5) e.title = 'Title must be at least 5 characters'
    if (title.trim().length > 200) e.title = 'Title must be 200 characters or fewer'
    if (body.trim().length < 10) e.body = 'Post must be at least 10 characters'
    if (body.trim().length > 5000) e.body = 'Post must be 5000 characters or fewer'
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
      })
      navigate(`/community/posts/${post.id}`)
    } catch (err) {
      // error handled via createPost.error
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
            <PenLine className="w-5 h-5 text-cyan-600" />
            <h1 className="text-2xl font-bold text-slate-800">New Post</h1>
          </div>
          {room && (
            <p className="text-slate-500 text-sm">
              Posting in <span className="font-medium text-slate-700">{room.name}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })) }}
                placeholder="What's your question or topic?"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:border-transparent text-base"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.title
                  ? <p className="text-sm text-red-600">{errors.title}</p>
                  : <span />
                }
                <span className="text-xs text-slate-400">{title.length}/200</span>
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Post <span className="text-red-400">*</span>
              </label>
              <textarea
                value={body}
                onChange={e => { setBody(e.target.value); setErrors(prev => ({ ...prev, body: undefined })) }}
                placeholder="Share your experience, question, or thoughts. Remember: don't include identifying details about the person in your care."
                rows={8}
                maxLength={5000}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:border-transparent text-base resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.body
                  ? <p className="text-sm text-red-600">{errors.body}</p>
                  : <span />
                }
                <span className="text-xs text-slate-400">{body.length}/5000</span>
              </div>
            </div>

            {/* Anonymous toggle */}
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                isAnonymous
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setIsAnonymous(prev => !prev)}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isAnonymous
                  ? <EyeOff className="w-5 h-5 text-slate-600" />
                  : <Eye className="w-5 h-5 text-slate-400" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {isAnonymous ? 'Posting anonymously' : 'Post anonymously'}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                  {isAnonymous
                    ? 'Your handle will not be shown. Your identity is still recorded internally for moderation.'
                    : 'Your community handle will be shown. Toggle to hide it from other users.'
                  }
                </p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-slate-600' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isAnonymous ? 'left-5' : 'left-1'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy reminder */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
            <strong className="font-semibold">Privacy reminder:</strong> Please do not include the full name, location, or specific medical details of the person you care for.
          </div>

          {createPost.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {(createPost.error as any)?.message ?? 'Something went wrong. Please try again.'}
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
