import { useState } from "react";
import { Heart } from "lucide-react";
import { getSession } from "../api";
import { isFavorite, toggleFavorite } from "../utils/lmsStorage";

export default function FavoriteHeart({ item, size = 15, style }) {
  const session = getSession();
  const [active, setActive] = useState(() => isFavorite(session, item.id));

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(toggleFavorite(session, item));
  };

  return (
    <button
      onClick={handleClick}
      title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="icon-btn-hover"
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: "none",
        background: "rgba(255,255,255,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        flexShrink: 0,
        ...style,
      }}
    >
      <Heart size={size} color={active ? "#ef4444" : "#9CA3AF"} fill={active ? "#ef4444" : "none"} />
    </button>
  );
}
