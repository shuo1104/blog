"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { cn } from "./ui/utils";
import { Bot, Sparkles, Cpu } from "lucide-react";

export type AgentContributionLevel = 0 | 1 | 2 | 3 | 4;

export type AgentContribution = {
  date: string;
  count: number;
  tokens?: number;
  level: AgentContributionLevel;
};

export type AgentModelStat = {
  name: string;
  count: string;
  logo?: React.ReactNode;
  href?: string;
};

const DEFAULT_ACCENT = "#8b5cf6"; // Electric Violet
const DEFAULT_CELL_SIZE = 11;
const DEFAULT_LABEL = "Top AI Models used:";
const DEFAULT_MONTHS = 12;
const WEEKS_PER_MONTH = 365.25 / 12 / 7;
const STACK_LIMIT = 4;
const MIN_CARD_WIDTH = 320;
const MIN_LABEL_WEEKS = 3;
const CARD_PADDING = 32;

const gapFor = (cellSize: number) => Math.max(2, Math.round(cellSize / 4));
const weeksFor = (months: number) =>
  Math.max(1, Math.ceil(months * WEEKS_PER_MONTH));

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", bounce: 0.2, duration: 0.62 } as const;
const HEADER_SPRING = { ...SPRING, bounce: 0.45 } as const;
const ROW_SPRING = { ...SPRING, bounce: 0.26, delay: 0.08 } as const;
const ROW_OFFSET = 16;
const CELL_FADE = { duration: 0.2, ease: EASE_OUT } as const;
const TOOLTIP_FADE = { duration: 0.14, ease: EASE_OUT } as const;
const TOOLTIP_EDGE = 8;
const COLUMN_STAGGER = 0.012;
const LABEL_BLUR = 6;
const LABEL_REVEAL = { duration: 0.45, ease: EASE_OUT } as const;

const LEVELS = [0, 1, 2, 3, 4] as const;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toMonthLabels(weeks: AgentContribution[][]) {
  const labels: (string | null)[] = weeks.map(() => null);
  const monthAt = (index: number) => weeks[index]?.[0]?.date.slice(5, 7);

  let start = 0;
  for (let i = 1; i <= weeks.length; i++) {
    if (i < weeks.length && monthAt(i) === monthAt(start)) continue;
    if (i - start >= MIN_LABEL_WEEKS) {
      labels[start] = MONTH_NAMES[Number(monthAt(start)) - 1] ?? null;
    }
    start = i;
  }

  return labels;
}

const LEVEL_OPACITY: Record<AgentContributionLevel, number> = {
  0: 0,
  1: 0.3,
  2: 0.52,
  3: 0.76,
  4: 1,
};

type LevelStyle = { backgroundColor: string; opacity: number };
type HoveredDay = { day: AgentContribution; x: number; y: number };

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatTokens(tokens?: number) {
  if (!tokens) return "";
  if (tokens >= 1_000_000) return ` (${(tokens / 1_000_000).toFixed(2)}M tokens)`;
  if (tokens >= 1_000) return ` (${(tokens / 1_000).toFixed(1)}K tokens)`;
  return ` (${tokens} tokens)`;
}

function describeDay({ count, tokens, date }: AgentContribution) {
  const noun = count === 1 ? "call" : "calls";
  const dateFormatted = DATE_FORMAT.format(new Date(`${date}T00:00:00`));
  if (!count) return `No agent activity on ${dateFormatted}`;
  return `${count} agent ${noun}${formatTokens(tokens)} on ${dateFormatted}`;
}

function toScale(accent: string | string[]): LevelStyle[] {
  if (typeof accent === "string") {
    return LEVELS.map((level) => ({
      backgroundColor: accent,
      opacity: LEVEL_OPACITY[level],
    }));
  }

  const colors = accent.length > 4 ? accent : ["transparent", ...accent];
  return LEVELS.map((level) => {
    const color = colors[level] ?? colors.at(-1) ?? "transparent";
    return { backgroundColor: color, opacity: color === "transparent" ? 0 : 1 };
  });
}

function toWeeks(contributions: AgentContribution[]) {
  const weeks: AgentContribution[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }
  return weeks;
}

function useFittedColumns(cellSize: number, gap: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [columns, setColumns] = React.useState<number>();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () =>
      setColumns(
        Math.max(1, Math.floor((el.clientWidth + gap) / (cellSize + gap)))
      );

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [cellSize, gap]);

  return [ref, columns] as const;
}

const Tooltip = ({
  hovered,
  reduceMotion,
}: {
  hovered: HoveredDay;
  reduceMotion: boolean | null;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [left, setLeft] = React.useState(hovered.x);

  useIsoLayoutEffect(() => {
    const half = (ref.current?.offsetWidth ?? 0) / 2;
    const edge = TOOLTIP_EDGE + half;
    setLeft(Math.min(Math.max(hovered.x, edge), window.innerWidth - edge));
  }, [hovered]);

  return createPortal(
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left,
        top: hovered.y,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
    >
      <motion.div
        ref={ref}
        className="whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={reduceMotion ? { duration: 0 } : TOOLTIP_FADE}
      >
        {describeDay(hovered.day)}
      </motion.div>
    </div>,
    document.body
  );
};

const AgentGrid = ({
  contributions,
  scale,
  cellSize,
  months,
  showMonths,
  label,
  reduceMotion,
}: {
  contributions: AgentContribution[];
  scale: LevelStyle[];
  cellSize: number;
  months: number;
  showMonths: boolean;
  label: string;
  reduceMotion: boolean | null;
}) => {
  const weeks = React.useMemo(() => toWeeks(contributions), [contributions]);
  const gap = gapFor(cellSize);
  const [ref, columns] = useFittedColumns(cellSize, gap);
  const [hovered, setHovered] = React.useState<HoveredDay>();

  const cap = Math.min(weeks.length, weeksFor(months));
  const visible = weeks.slice(-Math.min(cap, columns ?? cap));
  const sweepEnd = (visible.length - 1) * COLUMN_STAGGER + CELL_FADE.duration;

  const hover = (day: AgentContribution) => (event: React.PointerEvent) => {
    const cell = event.currentTarget.getBoundingClientRect();
    setHovered({ day, x: cell.left + cell.width / 2, y: cell.top });
  };

  return (
    <div
      ref={ref}
      data-slot="agent-activity-grid"
      role="img"
      aria-label={label}
      className="relative"
    >
      {showMonths && (
        <motion.div
          className="flex justify-center"
          style={{ gap, marginBottom: gap }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, filter: `blur(${LABEL_BLUR}px)` }
          }
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            ...LABEL_REVEAL,
            delay: reduceMotion ? 0 : sweepEnd,
          }}
        >
          {toMonthLabels(visible).map((month, index) => (
            <div
              key={index}
              className="relative h-3 shrink-0"
              style={{ width: cellSize }}
            >
              {month && (
                <span className="absolute left-0 top-0 text-[10px] leading-none text-foreground/40">
                  {month}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      )}

      <div
        className="flex justify-center overflow-hidden"
        style={{ gap }}
        onPointerLeave={() => setHovered(undefined)}
      >
        {visible.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col" style={{ gap }}>
            {week.map((day) => (
              <motion.div
                key={day.date}
                onPointerEnter={hover(day)}
                className="shrink-0 rounded-[3px] bg-foreground/[0.08]"
                style={{ width: cellSize, height: cellSize }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...CELL_FADE,
                  delay: reduceMotion ? 0 : weekIndex * COLUMN_STAGGER,
                }}
              >
                <div
                  className="h-full w-full rounded-[3px]"
                  style={scale[day.level] ?? scale[0]}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {hovered && (
          <Tooltip
            key="tooltip"
            hovered={hovered}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ModelAvatar = ({
  model,
  layoutId,
  transition,
  className,
}: {
  model: AgentModelStat;
  layoutId: string;
  transition: Transition;
  className?: string;
}) => (
  <motion.span
    layoutId={layoutId}
    transition={transition}
    className={cn(
      "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-purple-500/15 text-[11px] font-medium uppercase text-purple-600 dark:text-purple-400 ring-2 ring-background",
      className
    )}
  >
    <Cpu size={14} />
  </motion.span>
);

const ModelRow = ({
  model,
  layoutId,
  transition,
}: {
  model: AgentModelStat;
  layoutId: string;
  transition: Transition;
}) => {
  const className =
    "flex items-center gap-3 rounded-xl mx-2 px-2 py-2 transition-colors hover:bg-foreground/5";

  return (
    <div className={className}>
      <ModelAvatar model={model} layoutId={layoutId} transition={transition} />
      <span className="flex-1 truncate text-sm text-foreground font-mono text-xs sm:text-sm">
        {model.name}
      </span>
      <span className="text-xs sm:text-sm tabular-nums text-foreground/70 font-mono">
        {model.count}
      </span>
    </div>
  );
};

const Chevron = ({
  open,
  transition,
}: {
  open: boolean;
  transition: Transition;
}) => (
  <motion.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-7 text-[#C4C9CC] dark:text-[#3E4346]"
    initial={false}
    animate={{ rotate: open ? 180 : 0 }}
    transition={transition}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m16 10-4 4-4-4" />
  </motion.svg>
);

export type AgentActivityProps = React.ComponentProps<"div"> & {
  contributions?: AgentContribution[];
  models?: AgentModelStat[];
  totalCalls?: number;
  totalTokensFormatted?: string;
  year?: number;
  accent?: string | string[];
  cellSize?: number;
  months?: number;
  showMonths?: boolean;
  label?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AgentActivity({
  className,
  contributions: contributionsProp,
  models: modelsProp,
  totalCalls: totalCallsProp,
  totalTokensFormatted: totalTokensProp,
  year,
  accent = DEFAULT_ACCENT,
  cellSize = DEFAULT_CELL_SIZE,
  months = DEFAULT_MONTHS,
  showMonths = true,
  label = DEFAULT_LABEL,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  style,
  ...props
}: AgentActivityProps) {
  const reduceMotion = useReducedMotion();
  const uid = React.useId();
  const [openState, setOpenState] = React.useState(defaultOpen);

  const open = openProp ?? openState;
  const toggle = () => {
    if (openProp === undefined) setOpenState(!open);
    onOpenChange?.(!open);
  };

  const [fetchedData, setFetchedData] = React.useState<{
    totalEvents: number;
    totalTokensFormatted: string;
    contributions: AgentContribution[];
    repos: AgentModelStat[];
  } | null>(null);

  React.useEffect(() => {
    if (contributionsProp && modelsProp) return;
    let active = true;

    fetch("/agentsview-usage.json")
      .then((res) => res.json())
      .then((json) => {
        if (active && json && json.contributions) {
          setFetchedData({
            totalEvents: json.totalEvents || 2117,
            totalTokensFormatted: json.totalTokensFormatted || "42.1M",
            contributions: json.contributions,
            repos: json.repos || [],
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [contributionsProp, modelsProp]);

  // Initial fallback generator so it never renders blank while loading
  const fallbackContributions = React.useMemo(() => {
    const today = new Date();
    const totalDays = weeksFor(months) * 7;
    return Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (totalDays - 1 - i));
      return {
        date: date.toISOString().slice(0, 10),
        count: 0,
        level: 0 as AgentContributionLevel,
      };
    });
  }, [months]);

  const contributions =
    contributionsProp ?? fetchedData?.contributions ?? fallbackContributions;
  const models = modelsProp ?? fetchedData?.repos ?? [
    { name: "kimi-k3", count: "13.5M Tokens" },
    { name: "gemini-3.7-flash-control", count: "7.0M Tokens" },
    { name: "Gemini 3.5 Flash", count: "5.9M Tokens" },
    { name: "gemini-3.7-flash", count: "5.8M Tokens" },
  ];

  const totalCalls =
    totalCallsProp ??
    fetchedData?.totalEvents ??
    contributions.reduce((sum, d) => sum + d.count, 0);

  const totalTokensFormatted =
    totalTokensProp ?? fetchedData?.totalTokensFormatted ?? "42.1M";

  const scale = React.useMemo(() => toScale(accent), [accent]);
  const transition = reduceMotion ? { duration: 0 } : SPRING;
  const headerTransition = reduceMotion ? { duration: 0 } : HEADER_SPRING;
  const rowTransition = reduceMotion ? { duration: 0 } : ROW_SPRING;

  const kick = reduceMotion ? {} : { x: ROW_OFFSET, y: ROW_OFFSET };
  const listMotion = {
    initial: { opacity: 0, ...kick },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...kick },
  };

  const parsedYear = Number(contributions.at(-1)?.date.slice(0, 4));
  const displayYear = year ?? (Number.isFinite(parsedYear) ? parsedYear : null);
  const heading = `${totalCalls} agent calls (${totalTokensFormatted} tokens)${
    displayYear ? ` in ${displayYear}` : ""
  }`;

  const gap = gapFor(cellSize);
  const columns = Math.min(
    Math.ceil(contributions.length / 7),
    weeksFor(months)
  );
  const width = Math.max(
    MIN_CARD_WIDTH,
    columns * (cellSize + gap) - gap + CARD_PADDING
  );

  return (
    <div
      data-slot="agent-activity"
      className={cn(
        "relative max-w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 font-sans shadow-sm select-none dark:border-neutral-800 dark:bg-neutral-900",
        models.length > 0 && "pb-[76px]",
        className
      )}
      style={{ width, ...style }}
      {...props}
    >
      <p className="mb-4 text-base font-medium text-foreground px-1.5 flex items-center justify-between">
        <span className="truncate">{heading}</span>
        <span className="shrink-0 text-[10.5px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 rounded-full px-2 py-0.5 ml-2">
          AGENTSVIEW
        </span>
      </p>

      <AgentGrid
        contributions={contributions}
        scale={scale}
        cellSize={cellSize}
        months={months}
        showMonths={showMonths}
        label={heading}
        reduceMotion={reduceMotion}
      />

      {models.length > 0 && (
        <motion.div
          layout
          id={`${uid}-panel`}
          data-slot="agent-activity-panel"
          data-state={open ? "open" : "closed"}
          className={cn(
            "absolute inset-x-3 bottom-3 overflow-hidden border border-neutral-200/80 bg-neutral-50/95 shadow-sm backdrop-blur-xl dark:border-neutral-700/60 dark:bg-neutral-800/95",
            open ? "rounded-2xl" : "rounded-full"
          )}
          style={{ transformOrigin: "bottom center" }}
          transition={transition}
        >
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-between p-2 pl-3 select-none"
            aria-expanded={open}
            aria-controls={`${uid}-panel`}
            onClick={toggle}
          >
            <span className="flex items-center gap-2 truncate text-sm font-medium text-foreground/80">
              <span className="truncate">{label}</span>
              <span className="text-xs font-mono text-foreground/50">
                {models.length}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <span className="flex -space-x-1.5">
                {models.slice(0, STACK_LIMIT).map((model, i) => (
                  <ModelAvatar
                    key={model.name}
                    model={model}
                    layoutId={`${uid}-avatar-${model.name}`}
                    transition={headerTransition}
                    className={cn(
                      open && "opacity-0",
                      i > 0 && "hidden sm:grid"
                    )}
                  />
                ))}
              </span>
              <Chevron open={open} transition={headerTransition} />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="list"
                className="flex flex-col gap-0.5 pb-2"
                initial={listMotion.initial}
                animate={listMotion.animate}
                exit={listMotion.exit}
                transition={rowTransition}
              >
                {models.map((model) => (
                  <ModelRow
                    key={model.name}
                    model={model}
                    layoutId={`${uid}-avatar-${model.name}`}
                    transition={rowTransition}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default AgentActivity;
