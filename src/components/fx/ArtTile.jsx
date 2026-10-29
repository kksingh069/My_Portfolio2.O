/**
 * ArtTile — small generative SVG compositions used as hover previews.
 * Pure SVG, no images to load, crisp at any size.
 */
function Svg({ par, children }) {
  return (
    <svg viewBox="0 0 200 260" className="kks-art" preserveAspectRatio={par}>{children}</svg>
  );
}

export default function ArtTile({ kind, fit }) {
  // fit="slice" lets a portrait tile fill a landscape frame (used by the footer trail)
  const par = fit === "slice" ? "xMidYMid slice" : undefined;
  switch (kind) {
    case "orbit":
      return (
        <Svg par={par}>
          <rect width="200" height="260" fill="#2b4bff" />
          {[90, 70, 50, 30].map((r, i) => (
            <circle key={r} cx="100" cy="130" r={r} fill="none" stroke="#f2f1ec" strokeOpacity={0.25 + i * 0.2} strokeWidth="1" />
          ))}
          <circle cx="170" cy="96" r="9" fill="#f2f1ec" />
          <circle cx="100" cy="130" r="14" fill="#0a0a0a" />
          <text x="14" y="244" fill="#f2f1ec" fontFamily="monospace" fontSize="9" letterSpacing="2">CREATIVE/DEV</text>
        </Svg>
      );
    case "mesh":
      return (
        <Svg par={par}>
          <defs>
            <radialGradient id="artMesh" cx="30%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#ff5a36" />
              <stop offset="45%" stopColor="#7a2bff" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
          </defs>
          <rect width="200" height="260" fill="url(#artMesh)" />
          {Array.from({ length: 11 }, (_, i) => (
            <path key={i} d={`M0 ${40 + i * 20} Q100 ${10 + i * 22} 200 ${40 + i * 20}`} fill="none" stroke="#fff" strokeOpacity="0.22" />
          ))}
          <text x="14" y="244" fill="#fff" fontFamily="monospace" fontSize="9" letterSpacing="2">GLSL · R3F</text>
        </Svg>
      );
    case "wave":
      return (
        <Svg par={par}>
          <rect width="200" height="260" fill="#f2f1ec" />
          {Array.from({ length: 14 }, (_, i) => (
            <path
              key={i}
              d={`M-10 ${60 + i * 12} C40 ${30 + i * 12}, 80 ${100 + i * 12}, 120 ${60 + i * 12} S180 ${30 + i * 12}, 210 ${70 + i * 12}`}
              fill="none"
              stroke={i === 7 ? "#2b4bff" : "#0a0a0a"}
              strokeWidth={i === 7 ? 3 : 1}
            />
          ))}
          <text x="14" y="244" fill="#0a0a0a" fontFamily="monospace" fontSize="9" letterSpacing="2">EASE: EXPO.OUT</text>
        </Svg>
      );
    case "grid":
      return (
        <Svg par={par}>
          <rect width="200" height="260" fill="#0a0a0a" />
          {Array.from({ length: 6 }, (_, c) =>
            Array.from({ length: 8 }, (_, r) => (
              <rect
                key={`${c}-${r}`}
                x={12 + c * 30}
                y={12 + r * 28}
                width="24"
                height="22"
                rx="3"
                fill={(c * 3 + r) % 7 === 0 ? "#2b4bff" : "none"}
                stroke="#f2f1ec"
                strokeOpacity="0.25"
              />
            ))
          )}
          <text x="14" y="250" fill="#f2f1ec" fontFamily="monospace" fontSize="9" letterSpacing="2">8PX GRID</text>
        </Svg>
      );
    case "blocks":
      return (
        <Svg par={par}>
          <rect width="200" height="260" fill="#e8e6df" />
          <rect x="0" y="0" width="120" height="150" fill="#0a0a0a" />
          <rect x="120" y="0" width="80" height="80" fill="#ff5a36" />
          <rect x="120" y="80" width="80" height="70" fill="#f2f1ec" />
          <rect x="0" y="150" width="60" height="110" fill="#2b4bff" />
          <circle cx="130" cy="205" r="38" fill="#0a0a0a" />
          <text x="12" y="140" fill="#f2f1ec" fontFamily="monospace" fontSize="9" letterSpacing="2">TOKENS</text>
        </Svg>
      );
    case "pulse":
    default:
      return (
        <Svg par={par}>
          <rect width="200" height="260" fill="#0f2a1d" />
          <polyline
            points="0,170 30,170 42,120 54,200 66,90 80,170 120,170 132,140 144,170 200,170"
            fill="none"
            stroke="#5cff9d"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <text x="14" y="60" fill="#5cff9d" fontFamily="monospace" fontSize="34" fontWeight="700">98</text>
          <text x="14" y="78" fill="#5cff9d" fillOpacity="0.6" fontFamily="monospace" fontSize="8" letterSpacing="2">LIGHTHOUSE</text>
          <text x="14" y="244" fill="#5cff9d" fontFamily="monospace" fontSize="9" letterSpacing="2">60 FPS</text>
        </Svg>
      );
  }
}
