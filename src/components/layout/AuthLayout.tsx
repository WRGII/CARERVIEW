import { Outlet } from 'react-router-dom'
import CareHubSideNav from './CareHubSideNav'

export default function AuthLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
      <CareHubSideNav />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
