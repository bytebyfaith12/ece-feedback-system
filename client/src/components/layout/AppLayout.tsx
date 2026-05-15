import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useFeedbackStore } from "@/store/useFeedbackStore";

export function AppLayout() {
  const collapsed = useFeedbackStore((state) => state.sidebarCollapsed);
  return (
    <div className="min-h-screen bg-[#030b12] text-slate-100">
      <Sidebar />
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}
