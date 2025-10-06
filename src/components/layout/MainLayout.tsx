import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "../common/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}