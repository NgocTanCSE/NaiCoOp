/**
 * Minh hoạ vector theo từng sản phẩm / nhà vườn.
 * Thay cho nền hoạ tiết lá lặp lại: mỗi mặt hàng có hình vẽ riêng,
 * mỗi nhà vườn có phong cảnh riêng. Vẫn là "ảnh minh họa" — không phải ảnh thật.
 */

export type ArtKind =
  | 'rambutan'
  | 'durian'
  | 'pomelo'
  | 'cashew'
  | 'orchard-mixed'
  | 'orchard-pomelo'
  | 'orchard-red'
  | 'orchard-cashew'
  | 'orchard-generic'

export function kindForSeed(seed: string): ArtKind | null {
  const base = seed.replace(/-(?:\d+|thumb|thumbnail)$/i, '')
  if (/^P0[123]$/i.test(base)) return 'rambutan'
  if (/^P0[45]$/i.test(base)) return 'durian'
  if (/^P10$/i.test(base)) return 'pomelo'
  if (/^P11$/i.test(base)) return 'cashew'
  const farms: Record<string, ArtKind> = {
    'farm-ba-tu-demo': 'orchard-mixed',
    'farm-mua-xanh': 'orchard-mixed',
    'farm-an-lanh': 'orchard-pomelo',
    'farm-dat-do': 'orchard-red',
    'farm-dieu-binh-minh': 'orchard-cashew',
  }
  if (farms[base]) return farms[base]
  if (base.startsWith('farm-')) return 'orchard-generic'
  return null
}

/* ------------------------------------------------------------------ */
/* Sản phẩm                                                            */
/* ------------------------------------------------------------------ */

function backdrop(uid: string, from = '#FBF6E9', to = '#E7DCC2') {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-bg`} cx="34%" cy="26%" r="90%">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </radialGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#${uid}-bg)`} />
      {/* bokeh mờ */}
      <circle cx="30" cy="30" r="16" fill="#fff" opacity="0.35" />
      <circle cx="176" cy="118" r="22" fill="#fff" opacity="0.22" />
      <circle cx="168" cy="26" r="10" fill="#fff" opacity="0.3" />
      {/* bóng đổ mặt bàn */}
      <ellipse cx="100" cy="140" rx="72" ry="9" fill="#4a3a1e" opacity="0.12" />
    </>
  )
}

function RambutanFruit({
  cx,
  cy,
  r,
  uid,
  split,
}: {
  cx: number
  cy: number
  r: number
  uid: string
  split?: boolean
}) {
  const hairs = Array.from({ length: 22 }).map((_, i) => {
    const a = (i / 22) * Math.PI * 2
    return (
      <line
        key={i}
        x1={cx + Math.cos(a) * r * 0.95}
        y1={cy + Math.sin(a) * r * 0.95}
        x2={cx + Math.cos(a) * r * 1.24}
        y2={cy + Math.sin(a) * r * 1.24}
        stroke="#7E1B15"
        strokeWidth={1.15}
        strokeLinecap="round"
        opacity={0.7}
      />
    )
  })
  return (
    <g>
      {hairs}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${uid}-fr)`} />
      <circle cx={cx - r * 0.32} cy={cy - r * 0.36} r={r * 0.32} fill="#fff" opacity={0.2} />
      {split && (
        <g>
          <ellipse cx={cx} cy={cy} rx={r * 0.7} ry={r * 0.82} fill="#FBF3E2" />
          <ellipse cx={cx} cy={cy} rx={r * 0.7} ry={r * 0.82} fill="none" stroke="#E0CCA8" strokeWidth="0.8" />
          <circle cx={cx} cy={cy + r * 0.12} r={r * 0.2} fill="#C79A55" />
        </g>
      )}
    </g>
  )
}

function FruitRambutan({ uid }: { uid: string }) {
  return (
    <>
      {backdrop(uid, '#FBF6E9', '#E9DDC0')}
      <defs>
        <radialGradient id={`${uid}-fr`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#DC4E43" />
          <stop offset="0.6" stopColor="#B72E26" />
          <stop offset="1" stopColor="#8B1E17" />
        </radialGradient>
      </defs>
      <RambutanFruit cx={70} cy={96} r={26} uid={uid} />
      <RambutanFruit cx={134} cy={92} r={24} uid={uid} />
      <RambutanFruit cx={100} cy={120} r={22} uid={uid} />
      <RambutanFruit cx={100} cy={72} r={27} uid={uid} />
      <RambutanFruit cx={100} cy={40} r={15} uid={uid} split />
      {/* cuống + lá */}
      <path d="M100 20 q6 -10 16 -12" stroke="#5C7A3A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M110 12 q14 -6 22 2 q-12 8 -22 -2z" fill="#6C9C5B" />
    </>
  )
}

function DurianFruit({ cx, cy, rx, ry, open }: { cx: number; cy: number; rx: number; ry: number; open?: boolean }) {
  const n = 26
  const spikes = Array.from({ length: n }).map((_, i) => {
    const a = (i / n) * Math.PI * 2
    const bx = cx + Math.cos(a) * rx * 0.9
    const by = cy + Math.sin(a) * ry * 0.9
    const tx = cx + Math.cos(a) * rx * 1.16
    const ty = cy + Math.sin(a) * ry * 1.16
    const px = Math.cos(a + Math.PI / 2)
    const py = Math.sin(a + Math.PI / 2)
    return (
      <path
        key={i}
        d={`M${bx + px * 4} ${by + py * 4} L${tx} ${ty} L${bx - px * 4} ${by - py * 4} z`}
        fill="#7E8C46"
      />
    )
  })
  return (
    <g>
      {spikes}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#93A155" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#dk)`} opacity="0.55" />
      <ellipse cx={cx - rx * 0.3} cy={cy - ry * 0.35} rx={rx * 0.34} ry={ry * 0.34} fill="#fff" opacity="0.16" />
      {open && (
        <g>
          <ellipse cx={cx} cy={cy} rx={rx * 0.62} ry={ry * 0.66} fill="#F3E7C2" />
          <ellipse cx={cx - rx * 0.22} cy={cy + ry * 0.05} rx={rx * 0.22} ry={ry * 0.34} fill="#E8B23C" />
          <ellipse cx={cx + rx * 0.16} cy={cy + ry * 0.05} rx={rx * 0.22} ry={ry * 0.34} fill="#EFC355" />
        </g>
      )}
    </g>
  )
}

function FruitDurian({ uid }: { uid: string }) {
  return (
    <>
      {backdrop(uid, '#F6F1E1', '#E2D6B4')}
      <defs>
        <pattern id="dk" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M4.5 1 L8 8 L1 8 z" fill="#5F6E32" opacity="0.5" />
        </pattern>
      </defs>
      <DurianFruit cx={72} cy={92} rx={40} ry={46} />
      <DurianFruit cx={140} cy={100} rx={34} ry={38} open />
      <path d="M72 46 q4 -14 16 -18" stroke="#5C7A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  )
}

function FruitPomelo({ uid }: { uid: string }) {
  return (
    <>
      {backdrop(uid, '#F4F7EE', '#DCE8D2')}
      <defs>
        <radialGradient id={`${uid}-fr`} cx="34%" cy="28%" r="82%">
          <stop offset="0" stopColor="#B9D08A" />
          <stop offset="0.55" stopColor="#8FB35C" />
          <stop offset="1" stopColor="#5D7E36" />
        </radialGradient>
      </defs>
      {/* quả nguyên */}
      <circle cx={76} cy={96} r={40} fill={`url(#${uid}-fr)`} />
      <circle cx={62} cy={80} r={12} fill="#fff" opacity="0.22" />
      {/* cuống + lá */}
      <path d="M76 56 q2 -10 10 -14" stroke="#5C7A3A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M86 42 q18 -8 28 2 q-16 10 -28 -2z" fill="#6C9C5B" />
      {/* miếng cắt */}
      <g>
        <path d="M150 66 A42 42 0 0 1 150 138 Z" fill="#F6EFD5" />
        <path d="M150 66 L150 138" stroke="#E4D7A8" strokeWidth="1" />
        <path d="M150 66 A42 42 0 0 1 172 78 L150 90 Z" fill="#EFE3B8" opacity="0.8" />
        <ellipse cx={154} cy={102} rx={9} ry={16} fill="#FBF6E0" />
        <path d="M162 70 A42 42 0 0 1 162 134" stroke="#E4D7A8" strokeWidth="0.9" fill="none" />
      </g>
    </>
  )
}

function FruitCashew({ uid }: { uid: string }) {
  const nut = (x: number, y: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M0 0 C10 -8 22 -6 24 4 C26 14 14 20 4 16 C-6 12 -8 6 0 0 Z" fill="#D9B77A" />
      <path d="M3 2 C11 -3 19 -2 21 4" stroke="#B99A5E" strokeWidth="1.2" fill="none" />
    </g>
  )
  return (
    <>
      {backdrop(uid, '#F7EEDD', '#E4D2AE')}
      {/* bát gỗ */}
      <ellipse cx={100} cy={104} rx={56} ry={14} fill="#8A5A33" />
      <path d="M44 104 A56 14 0 0 0 156 104 L150 128 A50 12 0 0 1 50 128 Z" fill="#7A4E2C" />
      <ellipse cx={100} cy={102} rx={50} ry={11} fill="#A9773F" />
      {nut(84, 92, -12)}
      {nut(104, 96, 8)}
      {nut(94, 106, 24)}
      {nut(110, 106, -20)}
      {nut(76, 104, 40)}
      {/* lá điều */}
      <path d="M150 44 q22 -6 30 12 q-24 8 -30 -12z" fill="#6C9C5B" />
      <path d="M152 46 q16 2 26 12" stroke="#4E7A3E" strokeWidth="1.2" fill="none" />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Nhà vườn                                                            */
/* ------------------------------------------------------------------ */

function Tree({ x, y, s, fruit, canopy = '#5F8E45' }: { x: number; y: number; s: number; fruit?: string; canopy?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2.2" y="0" width="4.4" height="16" rx="1.6" fill="#6B4A2A" />
      <circle cx="-9" cy="-6" r="11" fill={canopy} />
      <circle cx="9" cy="-7" r="11.5" fill={canopy} />
      <circle cx="0" cy="-15" r="12.5" fill={canopy} />
      <circle cx="0" cy="-6" r="12" fill={canopy} />
      {fruit &&
        [
          [-10, -8],
          [8, -10],
          [0, -18],
          [3, -4],
          [-4, -13],
        ].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r="2.6" fill={fruit} />)}
    </g>
  )
}

function Orchard({ kind, uid }: { kind: ArtKind; uid: string }) {
  const red = kind === 'orchard-red'
  const pomelo = kind === 'orchard-pomelo'
  const cashew = kind === 'orchard-cashew'
  const fruitColor = cashew ? '#7FA05A' : pomelo ? '#9CBE72' : kind === 'orchard-mixed' ? '#C63B30' : '#C98B3C'
  const groundTop = red ? '#B4633A' : '#9AA86A'
  const groundBot = red ? '#8E4A2A' : '#7E8C4E'
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE6F2" />
          <stop offset="0.6" stopColor="#F0EDD8" />
          <stop offset="1" stopColor="#F7F1DE" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#${uid}-sky)`} />
      <circle cx="158" cy="34" r="16" fill="#F6DE9C" />
      <circle cx="158" cy="34" r="24" fill="#F6DE9C" opacity="0.35" />
      {/* đồi xa */}
      <path d="M0 70 Q50 46 100 66 T200 62 L200 150 L0 150 Z" fill="#A9C08A" opacity="0.85" />
      <path d="M0 84 Q60 66 120 82 T200 80 L200 150 L0 150 Z" fill="#8FB06D" />
      {/* mặt đất */}
      <path d="M0 96 Q100 84 200 96 L200 150 L0 150 Z" fill={groundTop} />
      <rect y="124" width="200" height="26" fill={groundBot} />
      {/* luống đất */}
      <path d="M0 120 Q100 108 200 120" stroke={red ? '#70381F' : '#6E7C42'} strokeWidth="2" fill="none" opacity="0.6" />
      {/* hàng cây gần */}
      <Tree x={34} y={104} s={1.25} fruit={fruitColor} />
      <Tree x={86} y={99} s={1.45} fruit={fruitColor} />
      <Tree x={142} y={105} s={1.2} fruit={fruitColor} />
      <Tree x={176} y={108} s={0.95} fruit={fruitColor} />
      {/* hàng cây xa */}
      <Tree x={20} y={86} s={0.62} />
      <Tree x={62} y={84} s={0.66} />
      <Tree x={112} y={85} s={0.64} />
      <Tree x={162} y={88} s={0.6} />
    </>
  )
}

/* ------------------------------------------------------------------ */

export function ProduceArt({
  kind,
  className = '',
  rounded = 'rounded-lg',
}: {
  kind: ArtKind
  className?: string
  rounded?: string
}) {
  const uid = `art-${kind}`
  return (
    <svg
      viewBox="0 0 200 150"
      preserveAspectRatio="xMidYMid slice"
      className={`${rounded} ${className}`}
      role="img"
      aria-hidden
    >
      {kind === 'rambutan' && <FruitRambutan uid={uid} />}
      {kind === 'durian' && <FruitDurian uid={uid} />}
      {kind === 'pomelo' && <FruitPomelo uid={uid} />}
      {kind === 'cashew' && <FruitCashew uid={uid} />}
      {kind.startsWith('orchard') && <Orchard kind={kind} uid={uid} />}
    </svg>
  )
}
