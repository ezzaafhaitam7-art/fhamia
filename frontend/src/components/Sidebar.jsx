import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, GraduationCap, FlaskConical, ClipboardList, MessageSquare, Eye, Heart, History } from "lucide-react";
import Logo from "./Logo";
import { getSession } from "../api";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/courses", label: "Courses", icon: GraduationCap },
  { to: "/ai-lab", label: "AI Lab", icon: FlaskConical },
  { to: "/visualisation", label: "Visualisation", icon: Eye },
  { to: "/quiz", label: "Quiz", icon: ClipboardList },
  { to: "/tutor", label: "Tutor", icon: MessageSquare },
  { to: "/favoris", label: "Favoris", icon: Heart },
  { to: "/historique", label: "Historique", icon: History },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const session = getSession();

  return (
    <aside
      style={{
        width: 220,
        background: "var(--panel)",
        borderRight: "1px solid var(--panel-border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        gap: 24,
      }}
    >
      <Link to="/" style={{ padding: "0 6px", display: "block" }}>
        <Logo size={18} />
      </Link>

      <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", textDecoration: "none" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--purple), var(--cyan))",
          }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-h)" }}>
            {session ? `${session.prenom} ${session.nom}` : "Invité"}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {session?.is_admin ? "Administrateur" : "Apprenant"}
          </div>
        </div>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--cyan)" : "var(--text)",
                background: active ? "var(--cyan-dim)" : "transparent",
                borderLeft: active ? "2px solid var(--cyan)" : "2px solid transparent",
              }}
            >
              <Icon size={16} /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
