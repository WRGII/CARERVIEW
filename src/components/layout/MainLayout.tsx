/**
 * MainLayout
 *
 * Outer layout component that provides the site-wide structure.
 * This includes:
 * - Persistent Header with navigation
 * - Persistent Footer
 * - React Router Outlet for rendering child routes
 *
 * This is applied at the route level in App.tsx and wraps ALL pages.
 * Individual pages can optionally use PageLayout for additional structure.
 */
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CommunityBanner from "./CommunityBanner";
import ScrollToTop from "../util/ScrollToTop";

export default function MainLayout() {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <ScrollToTop />
      <CommunityBanner />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}