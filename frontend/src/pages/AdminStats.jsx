import { useEffect, useState } from "react";
import { Users, GraduationCap, ClipboardList, BadgeCheck } from "lucide-react";
import AdminSidebar, { BLUE, BLUE_SOFT, INK, SUB, BORDER, PAGE_BG } from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import { api } from "../api";

const card = {
  background: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  padding: 20,
};

export default function AdminStats() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/accounts/utilisateurs/"),
      api.get("/courses/parcours/"),
      api.get("/quiz/quiz/"),
      api.get("/accounts/certificats/"),
    ]).then(([users, parcours, quiz, certs]) => {
      setCounts({
        users: users.length,
        parcours: parcours.length,
        quiz: quiz.length,
        certs: certs.length,
      });
    });
  }, []);

  const stats = [
    { label: "Utilisateurs", icon: Users, value: counts?.users },
    { label: "Parcours", icon: GraduationCap, value: counts?.parcours },
    { label: "Quiz", icon: ClipboardList, value: counts?.quiz },
    { label: "Certificats délivrés", icon: BadgeCheck, value: counts?.certs },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AdminHeader title="Stats" />
        <main style={{ padding: "24px 32px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {stats.map((s) => (
              <div key={s.label} style={card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: SUB }}>
                    {s.label}
                  </span>
                  <s.icon size={16} color={SUB} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: INK, fontFamily: "var(--mono)" }}>
                  {s.value ?? "…"}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
