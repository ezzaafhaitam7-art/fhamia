import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Trophy, FileText, ClipboardList, Bot, CheckCircle2 } from "lucide-react";
import { getSession } from "../api";
import { getReadNotificationIds, markAllNotificationsRead, markNotificationRead } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";

const ICONS = {
  certificat: Trophy,
  cours: FileText,
  quiz: ClipboardList,
  tuteur: Bot,
  parcours: CheckCircle2,
};

function timeAgo(ts) {
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `il y a ${diffD} j`;
}

// Construit des notifications réalistes à partir des vraies données de
// l'utilisateur (certificats, quiz, conversations) plutôt que d'un backend
// de notifications dédié (qui n'existe pas encore côté API).
export function buildNotifications({ certificats = [], progressions = [], conversations = [] } = {}) {
  const items = [];

  certificats.forEach((c) => {
    items.push({
      id: `cert-${c.id}`,
      type: "certificat",
      title: "Certificat obtenu",
      description: `Vous avez obtenu le certificat "${c.parcours_titre}".`,
      at: new Date(c.date_obtention).getTime() || Date.now(),
    });
  });

  progressions
    .filter((p) => p.pourcentage >= 100)
    .forEach((p) => {
      items.push({
        id: `parcours-done-${p.parcours}`,
        type: "parcours",
        title: "Parcours terminé",
        description: "Félicitations, vous avez terminé un parcours à 100%.",
        at: Date.now() - 3600_000,
      });
    });

  conversations.slice(0, 3).forEach((c) => {
    // Ignore le message d'accueil automatique (toujours en position 0) : on
    // ne veut notifier que d'une vraie réponse à une question posée.
    const messages = (c.messages || []).slice(1);
    const lastIa = [...messages].reverse().find((m) => m.role === "ia" && m.text);
    if (!lastIa) return;
    items.push({
      id: `tutor-${c.id}`,
      type: "tuteur",
      title: "Nouvelle réponse du tuteur IA",
      description: lastIa.text.slice(0, 90) + (lastIa.text.length > 90 ? "…" : ""),
      at: c.updatedAt || Date.now(),
    });
  });

  items.push({
    id: "quiz-new-reseaux",
    type: "quiz",
    title: "Nouveau quiz disponible",
    description: "Le quiz \"Réseaux Informatiques\" est prêt, teste tes connaissances.",
    at: Date.now() - 86_400_000,
  });
  items.push({
    id: "cours-new-ia",
    type: "cours",
    title: "Nouveau cours disponible",
    description: "Le parcours \"Intelligence Artificielle\" vient d'être enrichi.",
    at: Date.now() - 2 * 86_400_000,
  });

  return items.sort((a, b) => b.at - a.at);
}

export default function NotificationBell({ certificats, progressions, conversations }) {
  const session = getSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => getReadNotificationIds(session));
  const wrapRef = useRef(null);

  const notifications = useMemo(
    () => buildNotifications({ certificats, progressions, conversations }),
    [certificats, progressions, conversations]
  );
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpen = () => setOpen((v) => !v);

  const handleReadAll = () => {
    const ids = notifications.map((n) => n.id);
    markAllNotificationsRead(session, ids);
    setReadIds(ids);
  };

  const handleClickNotif = (n) => {
    markNotificationRead(session, n.id);
    setReadIds((prev) => (prev.includes(n.id) ? prev : [...prev, n.id]));
    if (n.type === "tuteur") navigate("/tutor");
    else if (n.type === "certificat") navigate("/dashboard");
    else if (n.type === "quiz") navigate("/quiz");
    else if (n.type === "cours") navigate("/courses");
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        title="Notifications"
        className="icon-btn-hover"
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: `1px solid ${BORDER}`,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Bell size={16} color={INK} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              background: "#ef4444",
              color: "#fff",
              fontSize: 9.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              border: "2px solid #fff",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 44,
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            background: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            boxShadow: "0 16px 40px -12px rgba(0,0,0,0.22)",
            zIndex: 60,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                style={{ background: "none", border: "none", color: BLUE, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", fontSize: 12.5, color: SUB }}>Aucune notification.</div>
          )}

          <div style={{ display: "flex", flexDirection: "column" }}>
            {notifications.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              const unread = !readIds.includes(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  style={{
                    display: "flex",
                    gap: 10,
                    textAlign: "left",
                    padding: "12px 16px",
                    border: "none",
                    borderBottom: `1px solid ${BORDER}`,
                    background: unread ? BLUE_SOFT : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: unread ? BLUE : "#eef1f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={14} color={unread ? "#fff" : SUB} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{n.title}</span>
                      {unread && <span style={{ width: 6, height: 6, borderRadius: "50%", background: BLUE, flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 11.5, color: SUB, margin: "2px 0 4px", lineHeight: 1.4, whiteSpace: "normal" }}>{n.description}</p>
                    <span style={{ fontSize: 10, color: "#9CA3AF" }}>{timeAgo(n.at)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
