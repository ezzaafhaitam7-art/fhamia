import { Inbox } from "lucide-react";
import { INK, SUB } from "./AdminSidebar";

export default function AdminEmptyState({ message }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: "50px 20px",
        color: SUB,
      }}
    >
      <Inbox size={28} color={SUB} />
      <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>Aucune donnée pour le moment</div>
      <div style={{ fontSize: 12, textAlign: "center", maxWidth: 340 }}>
        {message || "Les données apparaîtront ici une fois la base de données remplie."}
      </div>
    </div>
  );
}
