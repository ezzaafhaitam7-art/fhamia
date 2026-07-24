import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { getSession } from "../api";
import BackButton from "../components/BackButton";
import FavoriteHeart from "../components/FavoriteHeart";
import { getFavorites } from "../utils/lmsStorage";

const BLUE = "#1A56DB";
const BLUE_SOFT = "#EBF5FF";
const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";
const PAGE_BG = "#f8f9fa";

const TYPE_LABELS = {
  parcours: "Parcours",
  cours: "Cours",
  visualisation: "Visualisation",
  playground: "Playground",
};

export default function Favoris() {
  const session = getSession();
  const [favorites, setFavorites] = useState(() => getFavorites(session));

  const refresh = () => setFavorites(getFavorites(session));

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
          <Heart size={22} color="#ef4444" fill="#ef4444" />
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: INK }}>Mes favoris</h1>
        </div>
        <p style={{ fontSize: 14, color: SUB, margin: "-12px 0 0" }}>
          Retrouve ici les parcours, cours, visualisations et playgrounds que tu as enregistrés.
        </p>

        {favorites.length === 0 ? (
          <div style={{ background: "#fff", border: `1px dashed ${BORDER}`, borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
            <Heart size={30} color="#c7ccd4" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: 14, color: SUB, margin: 0 }}>
              Aucun favori pour l'instant. Clique sur le cœur d'un parcours, cours, visualisation ou playground pour l'ajouter ici.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
            {favorites.map((item) => (
              <div key={item.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }} onClick={refresh}>
                  <FavoriteHeart item={item} />
                </div>
                <div style={{ height: 84, background: BLUE_SOFT }} />
                <div style={{ padding: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: BLUE, background: BLUE_SOFT, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                    {TYPE_LABELS[item.type] || item.type}
                  </span>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: INK, margin: "8px 0 4px" }}>{item.title}</div>
                  {item.subtitle && <p style={{ fontSize: 12.5, color: SUB, lineHeight: 1.5, margin: "0 0 14px" }}>{item.subtitle}</p>}
                  <Link
                    to={item.to}
                    className="landing-cta-primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", fontWeight: 700, fontSize: 12.5, padding: "9px 16px", borderRadius: 9 }}
                  >
                    Ouvrir <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
