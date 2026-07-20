import { Outlet } from 'react-router-dom'
import CareHubSideNav from './CareHubSideNav'

export default function AuthLayout() {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>
      <CareHubSideNav />
      <main id="main-content" className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
