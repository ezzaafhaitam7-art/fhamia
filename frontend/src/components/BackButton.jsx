import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const INK = "#191c1d";
const SUB = "#434654";
const BORDER = "#e5e7eb";

export default function BackButton({ to, label = "Retour", style }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <button
      onClick={handleClick}
      className="icon-btn-hover"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        padding: "7px 14px 7px 10px",
        fontSize: 12.5,
        fontWeight: 600,
        color: INK,
        cursor: "pointer",
        ...style,
      }}
    >
      <ArrowLeft size={14} color={SUB} /> {label}
    </button>
  );
}
