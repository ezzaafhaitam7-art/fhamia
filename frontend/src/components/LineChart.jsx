export default function LineChart({ points = [0, 0, 0, 0, 0, 0, 0], days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] }) {
  const w = 460;
  const h = 160;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const stepX = w / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = h - ((p - min) / (max - min)) * (h - 20) - 10;
    return [x, y];
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineFill)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--cyan)" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-dim)", letterSpacing: 0.5 }}>
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}
