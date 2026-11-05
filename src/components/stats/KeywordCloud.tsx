"use client";

import CloudLayout from "d3-cloud";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { MIN_SAMPLE } from "@/lib/constants";
import type { Keyword } from "@/lib/keywords";
import type { Cloud, CloudBucket } from "@/lib/stats";

type Props = {
  clouds: Record<CloudBucket, Cloud>;
  optionA: string;
  optionB: string;
};

type Placed = { text: string; count: number; size: number; x: number; y: number };

const HEIGHT = 260;

const TABS: { key: CloudBucket; label: string; ink: string }[] = [
  { key: "all", label: "전체", ink: "fill-foreground" },
  { key: "A", label: "A 선택", ink: "fill-choice-a-ink" },
  { key: "B", label: "B 선택", ink: "fill-choice-b-ink" },
];

/** 같은 데이터면 항상 같은 배치가 나오도록 고정 시드 난수 (mulberry32) */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function layoutWords(keywords: Keyword[], width: number, fontFamily: string): Placed[] {
  const max = keywords[0].count;
  const min = keywords[keywords.length - 1].count;
  const maxSize = Math.min(44, Math.max(24, width / 9));
  const minSize = 14;
  const scale = (c: number) =>
    max === min ? (maxSize + minSize) / 2 : minSize + (maxSize - minSize) * Math.sqrt((c - min) / (max - min));

  const layout = new CloudLayout().size([width - 16, HEIGHT - 16]).overflow(false).random(seeded(42));
  const placed: Placed[] = [];
  // 큰 단어부터 놓는다 (keywords는 이미 많이 나온 순)
  for (const k of keywords) {
    const sprite = layout.getSprite(k.text, { size: scale(k.count), font: fontFamily, fontWeight: 400, padding: 3, rotate: 0, datum: k });
    const word = sprite && layout.place(sprite);
    if (word) placed.push({ text: k.text, count: k.count, size: word.size, x: word.x, y: word.y });
  }
  return placed;
}

function CloudSvg({ keywords, width, ink, label }: { keywords: Keyword[]; width: number; ink: string; label: string }) {
  const [placed, setPlaced] = useState<{ key: string; words: Placed[]; font: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layoutKey = `${width}:${keywords.map((k) => `${k.text}${k.count}`).join(",")}`;

  useEffect(() => {
    let cancelled = false;
    // 웹폰트가 로드된 뒤에 글자 크기를 재야 겹치지 않는다.
    // 한글 웹폰트는 글자 묶음(unicode-range)별로 나눠 받으므로, 키워드에 쓰인 글자를 먼저 불러온다.
    const svg = svgRef.current;
    if (!svg) return;
    const font = getComputedStyle(svg).fontFamily;
    const glyphs = keywords.map((k) => k.text).join("");
    Promise.all([document.fonts.load(`400 20px ${font}`, glyphs), document.fonts.ready])
      .catch(() => {}) // 폰트를 못 받아도 대체 폰트로 배치한다
      .then(() => {
        if (cancelled) return;
        setPlaced({ key: layoutKey, words: layoutWords(keywords, width, font), font });
      });
    return () => {
      cancelled = true;
    };
  }, [layoutKey, keywords, width]);

  const current = placed?.key === layoutKey ? placed : null;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={HEIGHT}
      viewBox={`${-width / 2} ${-HEIGHT / 2} ${width} ${HEIGHT}`}
      role="img"
      aria-label={`${label} 키워드: ${keywords.slice(0, 10).map((k) => `${k.text} ${k.count}명`).join(", ")}`}
      className="block font-display"
    >
      {current?.words.map((w) => (
        <text
          key={w.text}
          transform={`translate(${w.x},${w.y})`}
          textAnchor="middle"
          fontFamily={current.font}
          fontSize={w.size}
          fontWeight={400}
          className={`${ink} cursor-default transition-opacity hover:opacity-70`}
        >
          <title>{`${w.text} · ${w.count}명`}</title>
          {w.text}
        </text>
      ))}
    </svg>
  );
}

/** 딜레마 하나의 서술형 키워드. 전체 / A 선택 / B 선택 탭으로 나눠 본다. */
export function KeywordCloud({ clouds, optionA, optionB }: Props) {
  const [tab, setTab] = useState<CloudBucket>("all");
  const [boxRef, width] = useWidth<HTMLDivElement>();
  const id = useId();
  const current = clouds[tab];
  const meta = TABS.find((t) => t.key === tab)!;
  const tabTitle = tab === "all" ? "전체 응답" : `${meta.label}: ${tab === "A" ? optionA : optionB}`;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ARIA 탭 패턴: 선택된 탭만 Tab 순서에 두고, ←/→/Home/End로 탭을 옮기며 바로 선택한다
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = TABS.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label="키워드 보기" className="flex gap-1 rounded-xl bg-surface p-1">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`${id}-panel`}
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            className="flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1.5 py-2 text-sm font-display text-muted transition-colors
              aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-sm"
          >
            {t.key !== "all" && <span aria-hidden className={`size-2.5 rounded-full ${t.key === "A" ? "bg-choice-a" : "bg-choice-b"}`} />}
            {t.label}
            <span className="font-sans tabular-nums text-muted">
              {clouds[t.key].n}
              <span className="sr-only">건</span>
            </span>
          </button>
        ))}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`} className="space-y-2">
        <p className="text-sm text-muted">
          {tabTitle} · 서술형 {current.n}건 기준
        </p>

        <div ref={boxRef} className="w-full overflow-hidden rounded-2xl border border-line" style={{ minHeight: HEIGHT }}>
          {current.keywords === null ? (
            <p className="flex items-center justify-center px-4 text-center text-base text-muted" style={{ height: HEIGHT }}>
              응답이 {MIN_SAMPLE}개 이상 모이면 키워드를 보여 줘요.
            </p>
          ) : current.keywords.length === 0 ? (
            <p className="flex items-center justify-center px-4 text-center text-base text-muted" style={{ height: HEIGHT }}>
              두 명 이상이 함께 쓴 단어가 아직 없어요.
            </p>
          ) : (
            width > 0 && <CloudSvg keywords={current.keywords} width={width} ink={meta.ink} label={tabTitle} />
          )}
        </div>

        {current.keywords && current.keywords.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer py-1 font-display text-muted">키워드 목록으로 보기</summary>
            <ol className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {current.keywords.map((k, i) => (
                <li key={k.text} className="flex justify-between gap-2 tabular-nums">
                  <span>
                    {i + 1}. {k.text}
                  </span>
                  <span className="text-muted">{k.count}명</span>
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </div>
  );
}
