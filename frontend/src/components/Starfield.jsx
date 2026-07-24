export default function Starfield({ purple = true, cyanGlow = true }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.25,
        }}
      />
      {purple && (
        <div
          style={{
            position: "absolute",
            left: "8%",
            top: "55%",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "var(--purple)",
            filter: "blur(110px)",
            opacity: 0.28,
          }}
        />
      )}
      {cyanGlow && (
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "45%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "var(--cyan)",
            filter: "blur(110px)",
            opacity: 0.22,
          }}
        />
      )}
    </div>
  );
}
