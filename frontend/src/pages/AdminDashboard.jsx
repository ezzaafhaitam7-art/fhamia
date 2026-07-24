import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  HelpCircle,
  Users,
  Milestone,
  ClipboardList,
  Award,
  UserPlus,
  CheckCircle2,
  ClipboardCheck,
  BookOpen,
  Plus,
  FileText,
  Box,
  Terminal,
  BadgeCheck,
} from "lucide-react";
import AdminSidebar, { BLUE, BLUE_SOFT, INK, SUB, BORDER, PAGE_BG } from "../components/AdminSidebar";
import { api, getSession } from "../api";

const stats = (utilisateurs, parcoursList, quizCount, certificats) => [
  { label: "Utilisateurs totaux", icon: Users, value: utilisateurs.length.toLocaleString("fr-FR"), badge: "+12%", badgeColor: "#16a34a", badgeBg: "#f0fdf4" },
  { label: "Parcours actifs", icon: Milestone, value: String(parcoursList.length), badge: "Stable", badgeColor: SUB, badgeBg: PAGE_BG },
  { label: "Quiz disponibles", icon: ClipboardList, value: String(quizCount), badge: "+5", badgeColor: "#16a34a", badgeBg: "#f0fdf4" },
  { label: "Certificats délivrés", icon: Award, value: certificats.length.toLocaleString("fr-FR"), badge: "+128", badgeColor: "#16a34a", badgeBg: "#f0fdf4" },
];

const quickActions = [
  { icon: Plus, label: "Ajouter un parcours", to: "/admin/paths" },
  { icon: FileText, label: "Ajouter un cours PDF", to: "/admin/lessons" },
  { icon: ClipboardCheck, label: "Créer un quiz", to: "/admin/quiz" },
  { icon: Box, label: "Créer une visualisation", to: "/admin" },
  { icon: Terminal, label: "Créer un Playground", to: "/admin" },
  { icon: BadgeCheck, label: "Créer un certificat", to: "/admin/certificates" },
];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `Il y a ${mins} min${mins > 1 ? "s" : ""}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
}

export default function AdminDashboard() {
  const session = getSession();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [progressions, setProgressions] = useState([]);
  const [certificats, setCertificats] = useState([]);
  const [parcoursList, setParcoursList] = useState([]);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/accounts/utilisateurs/"),
      api.get("/quiz/progressions/"),
      api.get("/accounts/certificats/"),
      api.get("/courses/parcours/"),
      api.get("/quiz/quiz/").catch(() => []),
    ])
      .then(([users, progs, certs, parcours, quizzes]) => {
        setUtilisateurs(users);
        setProgressions(progs);
        setCertificats(certs);
        setParcoursList(parcours);
        setQuizCount(Array.isArray(quizzes) ? quizzes.length : 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const activity = [
    ...utilisateurs.slice(-3).map((u) => ({
      icon: UserPlus,
      color: BLUE,
      bg: BLUE_SOFT,
      text: (
        <>
          Nouvel utilisateur : <strong>{u.prenom} {u.nom}</strong> vient de s'inscrire.
        </>
      ),
      time: timeAgo(u.date_inscription),
      date: u.date_inscription,
    })),
    ...certificats.slice(-2).map((c) => ({
      icon: CheckCircle2,
      color: "#16a34a",
      bg: "#f0fdf4",
      text: (
        <>
          Certificat généré : <strong>{c.utilisateur_nom || "Un apprenant"}</strong> a terminé '{c.parcours_titre}'.
        </>
      ),
      time: timeAgo(c.date_obtention),
      date: c.date_obtention,
    })),
    ...progressions
      .filter((p) => p.pourcentage >= 100)
      .slice(-2)
      .map((p) => ({
        icon: ClipboardCheck,
        color: "#d97706",
        bg: "#fffbeb",
        text: <>Quiz terminé avec un score de {Math.round(p.pourcentage)}%.</>,
        time: "",
        date: null,
      })),
  ]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const visibleActivity = showAllActivity ? activity : activity.slice(0, 4);

  const filteredUsers = utilisateurs.filter((u) =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: BLUE_SOFT, borderRadius: 20, padding: "8px 16px", width: 320 }}>
            <Search size={15} color={SUB} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: INK, width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
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

        <main style={{ padding: "24px 32px 60px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", color: INK }}>Tableau de bord</h1>
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>Gérez l'ensemble de la plateforme FhamIA.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {stats(utilisateurs, parcoursList, quizCount, certificats).map((s) => (
              <div key={s.label} className="admin-stat-card" style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div className="admin-stat-icon" style={{ width: 40, height: 40, borderRadius: "50%", background: BLUE_SOFT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={18} color={BLUE} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.badgeColor, background: s.badgeBg, padding: "3px 9px", borderRadius: 20 }}>{s.badge}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: INK }}>{loading ? "…" : s.value}</div>
                <div style={{ fontSize: 12.5, color: SUB, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>Activité récente</h2>
                <span
                  onClick={() => setShowAllActivity((v) => !v)}
                  style={{ fontSize: 12, fontWeight: 700, color: BLUE, cursor: "pointer" }}
                >
                  {showAllActivity ? "RÉDUIRE" : "VOIR TOUT"}
                </span>
              </div>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
                {visibleActivity.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 18px", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <a.icon size={15} color={a.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, color: INK }}>{a.text}</div>
                      {a.time && <div style={{ fontSize: 11.5, color: SUB, marginTop: 2 }}>{a.time}</div>}
                    </div>
                  </div>
                ))}
                {!loading && visibleActivity.length === 0 && (
                  <div style={{ padding: 18, fontSize: 13, color: SUB }}>Aucune activité récente.</div>
                )}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: "0 0 14px" }}>Accès rapide</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {quickActions.map((a) => (
                  <Link
                    key={a.label}
                    to={a.to}
                    className="btn-outline-hover"
                    style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", fontSize: 13.5, fontWeight: 700, color: BLUE }}
                  >
                    <a.icon size={17} color={BLUE} /> {a.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>Gestion des utilisateurs</h2>
              <Link to="/admin/users" style={{ fontSize: 12.5, fontWeight: 700, color: BLUE }}>Voir tous les utilisateurs →</Link>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, color: SUB }}>
                  <th style={{ padding: "8px 6px", fontWeight: 700 }}>Nom</th>
                  <th style={{ padding: "8px 6px", fontWeight: 700 }}>Email</th>
                  <th style={{ padding: "8px 6px", fontWeight: 700 }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.slice(0, 6).map((u) => (
                  <tr key={u.id} style={{ borderTop: `1px solid ${BORDER}`, fontSize: 13 }}>
                    <td style={{ padding: "10px 6px", color: INK, fontWeight: 600 }}>
                      {u.prenom} {u.nom} {u.is_admin && <span style={{ fontSize: 10, color: BLUE }}>(admin)</span>}
                    </td>
                    <td style={{ padding: "10px 6px", color: SUB }}>{u.email}</td>
                    <td style={{ padding: "10px 6px" }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "3px 10px",
                          borderRadius: 20,
                          color: u.etat_compte === "actif" ? "#16a34a" : "#dc2626",
                          background: u.etat_compte === "actif" ? "#f0fdf4" : "#fef2f2",
                        }}
                      >
                        {u.etat_compte}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: "16px 6px", color: SUB, fontSize: 13 }}>
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
