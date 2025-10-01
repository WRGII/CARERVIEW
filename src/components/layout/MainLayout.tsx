import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "../common/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-dvh bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}