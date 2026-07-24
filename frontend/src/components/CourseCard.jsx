import { Link } from "react-router-dom";

export default function CourseCard({
  id,
  icon: Icon,
  bgIcon: BgIcon,
  level,
  title,
  description,
  progress,
  lessons,
  cta,
  featured = false,
  accent = "cyan",
  onCtaClick,
}) {
  const accentColor = accent === "purple" ? "var(--purple)" : "var(--cyan)";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--panel)",
        border: featured ? "1px solid var(--cyan)" : "1px solid var(--panel-border)",
        borderRadius: 14,
        padding: 22,
        boxShadow: featured ? "0 0 30px rgba(34,224,240,0.18)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {BgIcon && (
        <BgIcon
          size={110}
          strokeWidth={1}
          style={{
            position: "absolute",
            right: -18,
            bottom: -18,
            color: accentColor,
            opacity: 0.12,
          }}
        />
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--cyan-dim)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accentColor,
          }}
        >
          <Icon size={18} />
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: featured ? "#04141a" : "var(--text-dim)",
            background: featured ? "var(--cyan)" : "transparent",
            border: featured ? "none" : "1px solid var(--panel-border)",
            borderRadius: 20,
            padding: "4px 10px",
          }}
        >
          {featured ? "Parcours Phare" : level}
        </span>
      </div>

      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "var(--text-h)", position: "relative" }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, position: "relative" }}>
        {description}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", position: "relative" }}>
        <span>Progression: {progress}%</span>
        <span style={{ color: accentColor, fontWeight: 600 }}>{lessons}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--panel-border)", overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: accentColor }} />
      </div>

      <Link
        to={`/courses/${id}`}
        onClick={onCtaClick}
        style={{
          marginTop: 6,
          position: "relative",
          width: "100%",
          padding: "12px",
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 13,
          textAlign: "center",
          display: "block",
          border: featured || progress > 0 ? "none" : `1px solid ${accentColor}`,
          background: featured || progress > 0 ? accentColor : "transparent",
          color: featured || progress > 0 ? "#04141a" : accentColor,
        }}
      >
        {cta}
      </Link>
    </div>
  );
}
