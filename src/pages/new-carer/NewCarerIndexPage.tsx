import { useAuth } from '../../hooks/useAuth'
import CareHubSideNav from '../../components/layout/CareHubSideNav'
import NewCarerAuthPage from './NewCarerAuthPage'
import NewCarerPage from './NewCarerPage'

export default function NewCarerIndexPage() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <NewCarerPage />

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
      <CareHubSideNav />
      <div className="flex-1 min-w-0">
        <NewCarerAuthPage />
      </div>
    </div>
  )
}
