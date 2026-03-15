import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CircleCheck as CheckCircle2 } from 'lucide-react'
import { useMyCommunityProfile, useUpdateCommunityProfile, useCheckHandleAvailable } from '../hooks/useCommunityProfile'
import { AVATAR_COLORS } from '../lib/community'
import { Button } from '../components/ui/Button'

function HandleStatusIndicator({ handle, currentHandle }: { handle: string; currentHandle: string }) {
  const isUnchanged = handle.trim().toLowerCase() === currentHandle.toLowerCase()
  const isValid = handle.trim().length >= 3 && handle.trim().length <= 30 && /^[a-zA-Z0-9_-]+$/.test(handle.trim())
  const { data: available, isFetching } = useCheckHandleAvailable(
    isUnchanged || !isValid ? '' : handle.trim()
  )

  if (isUnchanged || !isValid || handle.trim().length < 3) return null
  if (isFetching) return <p className="text-xs text-slate-400 mt-1.5">Checking availability…</p>
  if (available === false) return <p className="text-xs text-red-600 mt-1.5">That handle is already taken.</p>
  if (available === true) return <p className="text-xs text-emerald-600 mt-1.5">Handle is available.</p>
  return null
}

export default function CommunityProfileEditPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useMyCommunityProfile()
  const updateProfile = useUpdateCommunityProfile()

  const [handle, setHandle] = useState('')
  const [handleError, setHandleError] = useState('')
  const [bio, setBio] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setHandle(profile.handle)
      setBio(profile.bio ?? '')
      setAvatarColor(profile.avatar_color ?? AVATAR_COLORS[0])
    }
  }, [profile])

  const validateHandle = (v: string) => {
    const clean = v.trim()
    if (clean.length > 0 && clean.length < 3) return 'Handle must be at least 3 characters.'
    if (clean.length > 30) return 'Handle must be 30 characters or fewer.'
    if (clean.length > 0 && !/^[a-zA-Z0-9_-]+$/.test(clean)) return 'Only letters, numbers, underscores, and hyphens are allowed.'
    return ''
  }

  const onHandleChange = (v: string) => {
    setHandle(v)
    setHandleError(validateHandle(v))
    setSaved(false)
  }

  const canSave = () => {
    if (!profile) return false
    if (updateProfile.isPending) return false
    const err = validateHandle(handle)
    if (err) return false
    const handleChanged = handle.trim().toLowerCase() !== profile.handle.toLowerCase()
    const bioChanged = bio.trim() !== (profile.bio ?? '')
    const colorChanged = avatarColor !== profile.avatar_color
    return handleChanged || bioChanged || colorChanged
  }

  const handleSave = async () => {
    if (!profile || !canSave()) return
    setHandleError('')

    const handleChanged = handle.trim().toLowerCase() !== profile.handle.toLowerCase()

    try {
      await updateProfile.mutateAsync({
        handle: handle.trim(),
        bio: bio.trim(),
        avatar_color: avatarColor,
        ...(handleChanged ? { handle_is_auto_generated: false } : {}),
      })
      setSaved(true)
      setTimeout(() => navigate('/community'), 1200)
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string }
      if (e?.message?.includes('duplicate') || e?.code === '23505') {
        setHandleError('That handle is already taken. Please choose another.')
      } else {
        setHandleError(e?.message ?? 'Something went wrong. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-sm">
          <p className="text-slate-600 mb-4">No community profile found.</p>
          <Link to="/community" className="text-cyan-600 hover:underline text-sm font-medium">Back to community</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white via-white to-peach-blush/20">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">

        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/community"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
            aria-label="Back to community"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Edit Community Profile</h1>
            <p className="text-xs text-slate-400">Changes are visible to other community members</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 transition-colors duration-200"
              style={{ backgroundColor: avatarColor }}
              aria-hidden="true"
            >
              {(handle.trim() || profile.handle).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{handle.trim() || profile.handle}</p>
              <p className="text-xs text-slate-400">{profile.post_count} posts · {profile.reply_count} replies</p>
            </div>
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Community handle <span className="text-slate-400 font-normal">(visible to others)</span>
            </label>
            <input
              type="text"
              value={handle}
              onChange={e => onHandleChange(e.target.value)}
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:border-transparent focus:bg-white transition-colors text-base"
              aria-describedby="handle-hint"
            />
            {handleError ? (
              <p className="text-xs text-red-600 mt-1.5">{handleError}</p>
            ) : (
              <HandleStatusIndicator handle={handle} currentHandle={profile.handle} />
            )}
            <p id="handle-hint" className="text-xs text-slate-400 mt-1.5">
              Letters, numbers, underscores, hyphens. 3–30 characters.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Bio <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => { setBio(e.target.value); setSaved(false) }}
              maxLength={200}
              rows={3}
              placeholder="A sentence about your caregiving journey…"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-primary focus:border-transparent focus:bg-white transition-colors text-sm resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{bio.length}/200</p>
          </div>

          {/* Avatar color */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Avatar colour
            </label>
            <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Choose avatar colour">
              {AVATAR_COLORS.map((color, idx) => {
                const names = ['Teal', 'Green-Teal', 'Green', 'Orange', 'Red', 'Purple', 'Blue', 'Brown']
                return (
                  <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={avatarColor === color}
                    onClick={() => { setAvatarColor(color); setSaved(false) }}
                    className={`w-9 h-9 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-primary ${
                      avatarColor === color ? 'ring-2 ring-offset-2 ring-cyan-primary scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={names[idx] ?? color}
                  />
                )
              })}
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">Profile saved! Returning to community…</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Link to="/community" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              disabled={!canSave() || !!handleError}
              onClick={handleSave}
            >
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
