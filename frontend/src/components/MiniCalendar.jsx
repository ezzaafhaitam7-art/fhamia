import { CalendarDays, FileText, ClipboardList, Bot, Target } from "lucide-react";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const TODAY_TASKS = [
  { icon: FileText, text: "Continuer le cours Linux" },
  { icon: ClipboardList, text: "Faire le quiz Réseaux" },
  { icon: Bot, text: "Poser une question au tuteur IA" },
  { icon: Target, text: "Objectif de la semaine" },
];

// studiedDays : Set de "YYYY-MM-DD" (dérivées de l'historique d'activité)
export default function MiniCalendar({ studiedDays = new Set() }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lundi=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateKey = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <CalendarDays size={15} color={BLUE} />
        <span style={{ fontSize: 13, fontWeight: 700, color: INK, textTransform: "capitalize" }}>{monthLabel}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={{ fontSize: 9.5, fontWeight: 700, color: "#9CA3AF", textAlign: "center" }}>{w}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 14 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = d === today;
          const studied = studiedDays.has(dateKey(d));
          return (
            <div
              key={i}
              title={studied ? "Vous avez étudié ce jour-là" : undefined}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10.5,
                fontWeight: isToday ? 700 : 500,
                borderRadius: 6,
                color: isToday ? "#fff" : studied ? BLUE : SUB,
                background: isToday ? BLUE : studied ? BLUE_SOFT : "transparent",
                position: "relative",
              }}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          Aujourd'hui
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TODAY_TASKS.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: INK }}>
              <t.icon size={13} color={BLUE} style={{ flexShrink: 0 }} /> {t.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
