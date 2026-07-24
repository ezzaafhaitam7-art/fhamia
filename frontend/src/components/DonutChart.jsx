export default function DonutChart({
  segments = [{ label: "Aucune donnée", value: 1, color: "#3f4557" }],
  centerLabel = "PARCOURS",
  centerSub = "REPARTITION",
}) {
  const size = 150;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const frac = seg.value / total;
    const dash = frac * c;
    const arc = { ...seg, dash, gap: c - dash, offset };
    offset -= dash;
    return arc;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#20242f" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${a.dash} ${a.gap}`}
              strokeDashoffset={a.offset}
              strokeLinecap="round"
            />
          ))}
        </g>
        <text x="50%" y="46%" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--cyan)" fontFamily="var(--mono)">
          {centerLabel}
        </text>
        <text x="50%" y="60%" textAnchor="middle" fontSize="8" letterSpacing="1" fill="var(--text-dim)">
          {centerSub}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.color, display: "inline-block" }} />
            {s.label} ({s.value}%)
          </div>
        ))}
      </div>
    </div>
  );
}
