/**
 * WorkCover — art-directed, code-generated project covers.
 * Swap any of these for a real <img> / <video> of your project later:
 *   <img src="/work/aether.jpg" alt="" className="kks-work-media" />
 */
export default function WorkCover({ kind, title }) {
  if (kind === "aether") {
    return (
      <div className="kks-cover kks-cover--aether">
        <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className="kks-cover-svg">
          <defs>
            <radialGradient id="aetherG" cx="50%" cy="42%" r="60%">
              <stop offset="0%" stopColor="#9fb2ff" />
              <stop offset="35%" stopColor="#2b4bff" />
              <stop offset="100%" stopColor="#060a24" />
            </radialGradient>
          </defs>
          <rect width="800" height="1000" fill="url(#aetherG)" />
          {Array.from({ length: 18 }, (_, i) => (
            <ellipse key={i} cx="400" cy="420" rx={60 + i * 26} ry={20 + i * 9} fill="none" stroke="#fff" strokeOpacity={0.5 - i * 0.025} />
          ))}
          <circle cx="400" cy="420" r="70" fill="#fff" fillOpacity="0.9" />
        </svg>
        <span className="kks-cover-word">{title}</span>
      </div>
    );
  }

  if (kind === "monolith") {
    return (
      <div className="kks-cover kks-cover--monolith" data-header="light">
        <div className="kks-mono-grid">
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className={i === 9 ? "is-red" : i === 14 ? "is-blue" : i % 5 === 0 ? "is-ink" : ""} />
          ))}
        </div>
        <span className="kks-cover-word kks-cover-word--ink">{title}</span>
        <span className="kks-cover-meta">Aa — Bb — 01 — 02 — Tokens v2.0</span>
      </div>
    );
  }

  if (kind === "pulse") {
    return (
      <div className="kks-cover kks-cover--pulse">
        <svg viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" className="kks-cover-svg">
          <rect width="800" height="1000" fill="#0b1f15" />
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1="0" x2="800" y1={100 + i * 80} y2={100 + i * 80} stroke="#5cff9d" strokeOpacity="0.08" />
          ))}
          {Array.from({ length: 16 }, (_, i) => {
            const h = 80 + ((i * 53) % 260);
            return <rect key={i} x={60 + i * 44} y={820 - h} width="26" height={h} fill="#5cff9d" fillOpacity={0.15 + (i % 4) * 0.12} />;
          })}
          <polyline
            className="kks-pulse-line"
            points="0,520 80,500 140,540 200,420 260,470 330,300 400,380 470,260 540,330 610,200 680,250 800,140"
            fill="none"
            stroke="#5cff9d"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <text x="60" y="140" fill="#5cff9d" fontFamily="monospace" fontSize="96" fontWeight="700">+248%</text>
          <text x="64" y="180" fill="#5cff9d" fillOpacity="0.6" fontFamily="monospace" fontSize="22" letterSpacing="6">LIVE · 12,480 EVENTS/S</text>
        </svg>
      </div>
    );
  }

  // drift — floating 3D shards
  return (
    <div className="kks-cover kks-cover--drift" data-header="light">
      <div className="kks-shards">
        <span className="kks-shard kks-shard--1" />
        <span className="kks-shard kks-shard--2" />
        <span className="kks-shard kks-shard--3" />
        <span className="kks-shard kks-shard--4" />
      </div>
      <span className="kks-cover-word kks-cover-word--ink">{title}</span>
    </div>
  );
}
