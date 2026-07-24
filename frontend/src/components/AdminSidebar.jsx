import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  Milestone,
  BookOpen,
  Box,
  Terminal,
  ClipboardList,
  MessageSquare,
  BadgeCheck,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";
import { clearSession } from "../api";

export const BLUE = "#1A56DB";
export const BLUE_SOFT = "#EBF5FF";
export const INK = "#191c1d";
export const SUB = "#434654";
export const BORDER = "#e5e7eb";
export const PAGE_BG = "#f8f9fa";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/paths", label: "Pathways", icon: Milestone },
  { to: "/admin/lessons", label: "Courses", icon: BookOpen },
  { to: "/admin", label: "Visualizations", icon: Box },
  { to: "/admin", label: "Playgrounds", icon: Terminal },
  { to: "/admin/quiz", label: "Quizzes", icon: ClipboardList },
  { to: "/admin", label: "AI Tutor", icon: MessageSquare },
  { to: "/admin/certificates", label: "Certificates", icon: BadgeCheck },
  { to: "/admin/stats", label: "Statistics", icon: BarChart3 },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: "#fff",
        borderRight: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        gap: 18,
        minHeight: "100vh",
      }}
    >
      <div style={{ padding: "0 6px" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: BLUE }}>FhamIA</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: SUB, letterSpacing: 0.6 }}>ADMIN CONSOLE</div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(({ to, label, icon: Icon }, i) => {
          const active = to !== "/admin" ? pathname === to : pathname === "/admin" && label === "Dashboard";
          return (
            <Link
              key={label + i}
              to={to}
              className="admin-sidebar-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? BLUE : INK,
                background: active ? BLUE_SOFT : "transparent",
              }}
            >
              <Icon size={16} color={active ? BLUE : SUB} /> {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => {
            clearSession();
            navigate("/login");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: INK,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <Settings size={16} color={SUB} /> Settings
        </button>

        <Link
          to="/admin/lessons"
          className="landing-cta-primary"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff", fontWeight: 700, fontSize: 13, padding: "11px", borderRadius: 10 }}
        >
          <Plus size={15} /> New Course
        </Link>
      </div>
    </aside>
  );
}
