import { Sparkle } from "lucide-react";

export default function Logo({ size = 20, color = "var(--cyan)" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 700,
        fontSize: size,
        color,
        letterSpacing: -0.3,
      }}
    >
      <Sparkle size={size + 2} strokeWidth={2.5} fill={color} />
      FhamIA
    </div>
  );
}
