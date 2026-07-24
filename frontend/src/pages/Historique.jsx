import { Link } from "react-router-dom";
import { History, FileText, Terminal, ClipboardList, Bot, Eye, Trophy, GraduationCap } from "lucide-react";
import { getSession } from "../api";
import BackButton from "../components/BackButton";
import { getActivity } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const ICONS = {
  cours: FileText,
  playground: Terminal,
  quiz: ClipboardList,
  tuteur: Bot,
  visualisation: Eye,
  certificat: Trophy,
  parcours: GraduationCap,
};

function dateLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Aujourd'hui";
  if (sameDay(d, yesterday)) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function Historique() {
  const session = getSession();
  const activity = getActivity(session);

  const groups = [];
  for (const entry of activity) {
    const label = dateLabel(entry.at);
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(entry);
  }

  return (
    <div style={{ minHeight: "100vh", background: PAGE_BG, color: INK, fontFamily: "inherit" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BackButton to="/dashboard" />
          <span style={{ fontSize: 20, fontWeight: 700, color: BLUE }}>FhamIA</span>
        </div>
        <Link to="/profile" style={{ width: 34, height: 34, borderRadius: "50%", background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {session ? `${session.prenom?.[0] || ""}${session.nom?.[0] || ""}` : "?"}
        </Link>
      </nav>

      <main style={{ width: "100%", padding: "28px 32px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <History size={22} color={BLUE} />
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: INK }}>Historique d'apprentissage</h1>
        </div>
        <p style={{ fontSize: 14, color: SUB, margin: "-12px 0 0" }}>
          Retrouve toutes tes activités récentes, classées par jour.
        </p>

        {groups.length === 0 ? (
          <div style={{ background: "#fff", border: `1px dashed ${BORDER}`, borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
            <History size={30} color="#c7ccd4" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>
              Aucune activité pour l'instant. Explore un cours, un playground ou un quiz pour commencer ton historique.
            </p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, maxWidth: 720 }}>
            {groups.map((group, gi) => (
              <div key={group.label} style={{ marginBottom: gi < groups.length - 1 ? 26 : 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>
                  {group.label}
                </div>
                <div style={{ position: "relative", paddingLeft: 26 }}>
                  <div style={{ position: "absolute", left: 9, top: 4, bottom: 4, width: 2, background: BORDER }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {group.items.map((entry) => {
                      const Icon = ICONS[entry.type] || FileText;
                      return (
                        <div key={entry.id} style={{ position: "relative" }}>
                          <div
                            style={{
                              position: "absolute",
                              left: -26,
                              top: 0,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: BLUE_SOFT,
                              border: `2px solid #fff`,
                              boxShadow: `0 0 0 1px ${BORDER}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={10} color={BLUE} />
                          </div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{entry.title}</div>
                          {entry.description && (
                            <div style={{ fontSize: 12, color: SUB, marginTop: 2 }}>{entry.description}</div>
                          )}
                          <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 3 }}>
                            {new Date(entry.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
