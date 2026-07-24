import { Link } from "react-router-dom";
import { Bell, HelpCircle } from "lucide-react";
import { BLUE, INK, SUB, BORDER } from "./AdminSidebar";
import { getSession } from "../api";

export default function AdminHeader({ title }) {
  const session = getSession();

  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff", gap: 24 }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: INK, margin: 0 }}>{title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Bell size={19} color={SUB} />
        <Link to="/support" style={{ display: "flex" }}>
          <HelpCircle size={19} color={SUB} />
        </Link>
        <div style={{ width: 1, height: 24, background: BORDER }} />
        <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>Admin {session?.prenom || "FhamIA"}</div>
            <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 0.4 }}>Super utilisateur</div>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "A"}
          </div>
        </Link>
      </div>
    </nav>
  );
}
