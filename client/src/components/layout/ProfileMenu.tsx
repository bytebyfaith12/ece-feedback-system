import { LogIn, LogOut, Settings, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DropdownLink, DropdownMenu } from "@/components/layout/DropdownMenu";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link to="/login" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
        <LogIn className="size-4" />
        Login
      </Link>
    );
  }

  return (
    <DropdownMenu label={user.fullName.split(" ")[0] || "Profile"}>
      <div className="px-3 py-2">
        <p className="text-sm font-bold text-white">{user.fullName}</p>
        <p className="text-xs text-slate-400">{user.role}</p>
      </div>
      <DropdownLink onClick={() => navigate("/profile")}>
        <span className="inline-flex items-center gap-2"><UserCircle className="size-4" /> Profile</span>
      </DropdownLink>
      <DropdownLink onClick={() => navigate("/settings")}>
        <span className="inline-flex items-center gap-2"><Settings className="size-4" /> Settings</span>
      </DropdownLink>
      <DropdownLink
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        <span className="inline-flex items-center gap-2 text-rose-300"><LogOut className="size-4" /> Logout</span>
      </DropdownLink>
    </DropdownMenu>
  );
}
