import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, LogOut } from "lucide-react";
import { api, getSession, clearSession } from "../api";
import NotificationBell from "./NotificationBell";

export default function TopBar() {
  const session = getSession();
  const navigate = useNavigate();
  const [points, setPoints] = useState(null);
  const [progressions, setProgressions] = useState([]);
  const [certificats, setCertificats] = useState([]);

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  useEffect(() => {
    if (!session) return;
    api
      .get("/quiz/progressions/")
      .then((progs) => {
        const mine = progs.filter((p) => p.utilisateur === session.id);
        setProgressions(mine);
        setPoints(mine.reduce((sum, p) => sum + p.points, 0));
      })
      .catch(() => {});
    api
      .get("/accounts/certificats/")
      .then((certs) => setCertificats(certs.filter((c) => c.utilisateur === session.id)))
      .catch(() => {});
  }, []);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 14,
        padding: "14px 28px",
        borderBottom: "1px solid var(--panel-border)",
        background: "var(--bg)",
      }}
    >
      {session && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-h)",
            background: "var(--panel)",
            border: "1px solid var(--panel-border)",
            borderRadius: 20,
            padding: "6px 12px",
          }}
        >
          <Star size={14} color="var(--purple)" fill="var(--purple)" /> {points ?? "…"} XP
        </div>
      )}
      {session ? (
        <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-h)" }}>
              {session.prenom} {session.nom}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              {session.is_admin ? "Administrateur" : "Apprenant"}
            </div>
          </div>
          <div
            style={{
              position: "relative",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--purple), var(--cyan))",
            }}
          >
            <span
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#22c55e",
                border: "2px solid var(--bg)",
              }}
            />
          </div>
        </Link>
      ) : (
        <>
          <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: "var(--cyan)" }}>
            Se connecter
          </Link>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--purple), var(--cyan))",
            }}
          />
        </>
      )}
      {session && (
        <NotificationBell
          certificats={certificats}
          progressions={progressions}
          conversations={(() => {
            try {
              const raw = localStorage.getItem(`fhamia-tutor-conversations-${session.id}`);
              const parsed = raw ? JSON.parse(raw) : [];
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })()}
        />
      )}
      <div style={{ fontSize: 12, color: "var(--cyan)", fontWeight: 700 }}>
        FR/<span style={{ color: "var(--text-dim)" }}>الدارجة</span>
      </div>
      {session && (
        <button
          onClick={handleLogout}
          title="Se déconnecter"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1px solid var(--panel-border)",
            color: "var(--text-dim)",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <LogOut size={14} /> Déconnexion
        </button>
      )}
    </header>
  );
}
