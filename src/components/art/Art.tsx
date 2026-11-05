/**
 * 숲길 색으로 직접 그린 꾸밈 그림. 색은 globals.css의 --art-* 토큰만 써서 라이트·다크를 따라간다.
 * 모두 꾸밈용이라 aria-hidden이다(화면 낭독기가 읽지 않는다).
 *
 * 딜레마 그림은 상황 속 물건만 그린다. 한쪽 선택에 마음이 기울게 하는 인물·표정은 넣지 않는다.
 * A·B 선택지에는 그림을 붙이지 않는다(응답에 영향이 없도록).
 */

const C = {
  leaf: "var(--art-leaf)",
  leaf2: "var(--art-leaf2)",
  soft: "var(--art-soft)",
  paper: "var(--art-paper)",
  line: "var(--art-line)",
  sun: "var(--art-sun)",
  cheek: "var(--art-cheek)",
};

type SvgProps = { className?: string };

function Leaf({ x, y, r, s = 1, fill = C.leaf }: { x: number; y: number; r: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C 8 -13, 28 -13, 36 0 C 28 13, 8 13, 0 0 Z" fill={fill} />
      <path d="M3 0 H 30" stroke={C.paper} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -7 Q 1.2 -1.2 7 0 Q 1.2 1.2 0 7 Q -1.2 1.2 -7 0 Q -1.2 -1.2 0 -7 Z"
      fill={C.sun}
    />
  );
}

/** 첫 화면: 새싹 양옆에 같은 색 말풍선 두 개 */
export function HomeArt({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 300 170" aria-hidden className={className}>
      <ellipse cx="150" cy="150" rx="128" ry="16" fill={C.soft} />
      <rect x="18" y="28" width="86" height="54" rx="22" fill={C.paper} stroke={C.line} strokeWidth={2.5} />
      <path d="M70 80 L 82 96 L 84 80" fill={C.paper} stroke={C.line} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M70 79.5 H 84" stroke={C.paper} strokeWidth={3} />
      <circle cx="44" cy="55" r="4.5" fill={C.leaf} />
      <circle cx="61" cy="55" r="4.5" fill={C.leaf} />
      <circle cx="78" cy="55" r="4.5" fill={C.leaf} />

      <rect x="196" y="20" width="86" height="54" rx="22" fill={C.paper} stroke={C.line} strokeWidth={2.5} />
      <path d="M216 72 L 214 88 L 228 72" fill={C.paper} stroke={C.line} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M215 71.5 H 229" stroke={C.paper} strokeWidth={3} />
      <path d="M232 40 q 0 -9 9 -9 q 9 0 9 8 q 0 6 -9 9 v 5" fill="none" stroke={C.leaf} strokeWidth={4} strokeLinecap="round" />
      <circle cx="241" cy="62" r="2.8" fill={C.leaf} />

      <g className="art-sway">
        <path d="M150 148 C 150 128, 151 112, 150 96" stroke={C.leaf} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Leaf x={150} y={104} r={-150} s={1.15} fill={C.leaf2} />
        <Leaf x={150} y={96} r={-30} s={1.25} />
      </g>
      <ellipse cx="150" cy="149" rx="22" ry="6" fill={C.leaf2} opacity={0.55} />
      <Sparkle x={122} y={70} s={0.9} />
      <Sparkle x={184} y={100} s={0.7} />
      <Sparkle x={108} y={122} s={0.6} />
    </svg>
  );
}

/** 완료 화면: 웃는 화분에서 자란 하트 잎과 흩날리는 나뭇잎 */
export function DoneArt({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 240 190" aria-hidden className={className}>
      <ellipse cx="120" cy="176" rx="90" ry="10" fill={C.soft} />
      <Leaf x={36} y={46} r={20} s={0.55} fill={C.leaf2} />
      <Leaf x={190} y={34} r={150} s={0.5} />
      <Leaf x={204} y={110} r={-20} s={0.45} fill={C.leaf2} />
      <Leaf x={22} y={118} r={-160} s={0.45} />
      <Sparkle x={64} y={26} s={0.9} />
      <Sparkle x={176} y={76} s={0.8} />
      <Sparkle x={52} y={90} s={0.6} />
      <g className="art-sway">
        <path d="M120 132 C 120 112, 121 94, 120 74" stroke={C.leaf} strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M120 70 C 120 58, 104 52, 98 62 C 92 72, 108 84, 120 92 C 132 84, 148 72, 142 62 C 136 52, 120 58, 120 70 Z" fill={C.leaf} />
        <Leaf x={120} y={112} r={-155} s={0.9} fill={C.leaf2} />
        <Leaf x={120} y={104} r={-25} s={0.9} fill={C.leaf2} />
      </g>
      <path
        d="M90 130 H 150 L 144 170 C 143.5 173, 141 175, 138 175 H 102 C 99 175, 96.5 173, 96 170 Z"
        fill={C.paper}
        stroke={C.line}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <rect x="86" y="124" width="68" height="12" rx="5" fill={C.leaf2} stroke={C.line} strokeWidth={2.5} />
      <circle cx="108" cy="152" r="3" fill={C.line} />
      <circle cx="132" cy="152" r="3" fill={C.line} />
      <path d="M114 158 Q 120 164 126 158" fill="none" stroke={C.line} strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx="102" cy="159" rx="5" ry="3" fill={C.cheek} />
      <ellipse cx="138" cy="159" rx="5" ry="3" fill={C.cheek} />
    </svg>
  );
}

/** 1. 친구의 부정행위: 시험지와 연필 */
function ExamIcon() {
  return (
    <>
      <g transform="rotate(-8 30 32)">
        <rect x="15" y="12" width="30" height="40" rx="5" fill={C.paper} stroke={C.line} strokeWidth={2.2} />
        <rect x="20" y="19" width="5" height="5" rx="1.2" fill="none" stroke={C.leaf} strokeWidth={1.8} />
        <path d="M28 21.5 H 40" stroke={C.line} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
        <rect x="20" y="29" width="5" height="5" rx="1.2" fill="none" stroke={C.leaf} strokeWidth={1.8} />
        <path d="M28 31.5 H 38" stroke={C.line} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
        <path d="M20 41.5 H 36" stroke={C.line} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      </g>
      <g transform="translate(40 30) rotate(35)">
        <rect x="-3.5" y="-2" width="7" height="22" rx="1.5" fill={C.sun} stroke={C.line} strokeWidth={1.8} />
        <path d="M-3.5 20 L 0 27 L 3.5 20 Z" fill={C.paper} stroke={C.line} strokeWidth={1.8} strokeLinejoin="round" />
        <rect x="-3.5" y="-6" width="7" height="5" rx="1.5" fill={C.cheek} stroke={C.line} strokeWidth={1.8} />
      </g>
    </>
  );
}

/** 2. 솔직한 의견: 이젤 위 그림과 작은 말풍선 */
function EaselIcon() {
  return (
    <>
      <path d="M22 52 L 28 40 M42 52 L 36 40 M32 52 V 42" stroke={C.line} strokeWidth={2.2} strokeLinecap="round" />
      <rect x="15" y="17" width="34" height="26" rx="4" fill={C.paper} stroke={C.line} strokeWidth={2.2} />
      <path d="M18 40 Q 26 29 33 36 T 46 33 V 40 Z" fill={C.leaf2} />
      <circle cx="40" cy="25" r="3.6" fill={C.sun} />
      <g transform="translate(43 6)">
        <rect x="0" y="0" width="16" height="12" rx="5" fill={C.paper} stroke={C.line} strokeWidth={1.8} />
        <path d="M4 11.5 L 3 16 L 8 11.5" fill={C.paper} stroke={C.line} strokeWidth={1.8} strokeLinejoin="round" />
        <circle cx="5" cy="6" r="1.3" fill={C.leaf} />
        <circle cx="8" cy="6" r="1.3" fill={C.leaf} />
        <circle cx="11" cy="6" r="1.3" fill={C.leaf} />
      </g>
    </>
  );
}

/** 3. 상 나누기: 트로피와 똑같은 동그라미 다섯 개(팀원 5명) */
function TrophyIcon() {
  return (
    <>
      <path
        d="M22 14 H 42 V 24 C 42 31, 37 35, 32 35 C 27 35, 22 31, 22 24 Z"
        fill={C.sun}
        stroke={C.line}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <path d="M22 17 C 15 17, 15 26, 23 27 M42 17 C 49 17, 49 26, 41 27" fill="none" stroke={C.line} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M32 35 V 40 M26 43 H 38" stroke={C.line} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M32 19.5 l 1.6 3.2 3.5 .5 -2.5 2.4 .6 3.4 -3.2 -1.7 -3.2 1.7 .6 -3.4 -2.5 -2.4 3.5 -.5 Z" fill={C.paper} />
      <g fill={C.leaf}>
        {[16, 24, 32, 40, 48].map((cx) => (
          <circle key={cx} cx={cx} cy="51" r="3.6" />
        ))}
      </g>
    </>
  );
}

/** 문항이 늘어나 그림이 없는 딜레마는 새싹을 보여 준다 */
function SproutIcon() {
  return (
    <>
      <path d="M32 50 C 32 42, 32.5 36, 32 30" stroke={C.leaf} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Leaf x={32} y={36} r={-150} s={0.55} fill={C.leaf2} />
      <Leaf x={32} y={31} r={-30} s={0.6} />
    </>
  );
}

// 딜레마 id는 마이그레이션(*_dilemmas.sql)에서 고정된다
const DILEMMA_ICONS: Record<number, () => React.JSX.Element> = { 1: ExamIcon, 2: EaselIcon, 3: TrophyIcon };

/** 딜레마별 동그란 그림. 설문 상황 카드와 통계 카드에 같이 쓴다 */
export function DilemmaIcon({ id, className }: SvgProps & { id: number }) {
  const Icon = DILEMMA_ICONS[id] ?? SproutIcon;
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <circle cx="32" cy="32" r="30" fill={C.soft} />
      <Icon />
    </svg>
  );
}
