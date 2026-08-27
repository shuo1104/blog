import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "@/app/components/ui/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

// Tailwind-only scroll area — self-contained, no global CSS.
const HIDE_SCROLLBAR =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

type ScrollAxis = "y" | "x" | "both";
type ThumbMetrics = { size: number; offset: number; active: boolean };

function getScrollViewportClasses(axis: ScrollAxis): Readonly<{
  overflowClass: string;
  clipClass: string;
}> {
  if (axis === "x") {
    return {
      overflowClass: "overflow-x-scroll overflow-y-hidden",
      clipClass: "-mb-4 pb-4",
    };
  }

  if (axis === "both") {
    return {
      overflowClass: "overflow-scroll",
      clipClass: "-mr-4 pr-4 -mb-4 pb-4",
    };
  }

  return {
    overflowClass: "overflow-y-scroll overflow-x-hidden",
    clipClass: "-mr-4 pr-4",
  };
}

function computeVerticalThumb(el: HTMLElement): ThumbMetrics {
  const { scrollHeight, clientHeight, scrollTop } = el;
  if (scrollHeight <= clientHeight + 1)
    return { size: 0, offset: 0, active: false };
  const thumbSize = Math.max(24, (clientHeight / scrollHeight) * clientHeight);
  const maxOffset = clientHeight - thumbSize;
  const offset =
    maxOffset <= 0
      ? 0
      : (scrollTop / (scrollHeight - clientHeight)) * maxOffset;
  return { size: thumbSize, offset, active: true };
}

function computeHorizontalThumb(el: HTMLElement): ThumbMetrics {
  const { scrollWidth, clientWidth, scrollLeft } = el;
  if (scrollWidth <= clientWidth + 1)
    return { size: 0, offset: 0, active: false };
  const thumbSize = Math.max(36, (clientWidth / scrollWidth) * clientWidth);
  const maxOffset = clientWidth - thumbSize;
  const offset =
    maxOffset <= 0 ? 0 : (scrollLeft / (scrollWidth - clientWidth)) * maxOffset;
  return { size: thumbSize, offset, active: true };
}

type LocalScrollHoverAreaProps = Readonly<
  {
    children: React.ReactNode;
    viewportClassName?: string;
    axis?: ScrollAxis;
  } & React.ComponentPropsWithoutRef<"div">
>;

const LocalScrollHoverArea = forwardRef<
  HTMLDivElement,
  LocalScrollHoverAreaProps
>(({ className, viewportClassName, children, axis = "y", ...props }, ref) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState<ThumbMetrics>({
    size: 0,
    offset: 0,
    active: false,
  });
  const [horizontal, setHorizontal] = useState<ThumbMetrics>({
    size: 0,
    offset: 0,
    active: false,
  });
  const [isDraggingH, setIsDraggingH] = useState(false);

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    if (axis === "y" || axis === "both") setVertical(computeVerticalThumb(el));
    if (axis === "x" || axis === "both")
      setHorizontal(computeHorizontalThumb(el));
  }, [axis]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    el.addEventListener("scroll", update, { passive: true });
    globalThis.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
      globalThis.removeEventListener("resize", update);
    };
  }, [update, children]);

  // Handle clicking on the track to jump scroll position
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thumbWidth = horizontal.size;
    const maxOffset = rect.width - thumbWidth;
    if (maxOffset <= 0) return;

    const targetOffset = Math.max(0, Math.min(maxOffset, clickX - thumbWidth / 2));
    const targetScroll = (targetOffset / maxOffset) * (el.scrollWidth - el.clientWidth);

    el.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  // Handle dragging the horizontal scrollbar thumb
  const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const el = viewportRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    setIsDraggingH(true);
    const startX = e.clientX;
    const startScrollLeft = el.scrollLeft;
    const trackWidth = track.clientWidth;
    const thumbWidth = horizontal.size;
    const maxOffset = trackWidth - thumbWidth;
    const maxScroll = el.scrollWidth - el.clientWidth;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (maxOffset > 0 && maxScroll > 0) {
        const deltaScroll = (deltaX / maxOffset) * maxScroll;
        el.scrollLeft = Math.max(0, Math.min(maxScroll, startScrollLeft + deltaScroll));
      }
    };

    const onPointerUp = () => {
      setIsDraggingH(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  const { overflowClass, clipClass } = getScrollViewportClasses(axis);

  return (
    <div
      ref={ref}
      className={cn("group/scrollarea relative overflow-hidden pb-3", className)}
      {...props}
    >
      <div
        ref={viewportRef}
        className={cn(
          "h-full w-full",
          HIDE_SCROLLBAR,
          overflowClass,
          clipClass,
          viewportClassName,
        )}
      >
        {children}
      </div>

      {/* Interactive Horizontal Scrollbar Track & Thumb */}
      {horizontal.active && (axis === "x" || axis === "both") && (
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className={cn(
            "absolute right-2 bottom-0 left-2 z-20 h-2.5 cursor-pointer rounded-full transition-all duration-150 flex items-center",
            "bg-neutral-100/60 hover:bg-neutral-200/80 dark:bg-neutral-800/40 dark:hover:bg-neutral-800/80",
            isDraggingH && "bg-neutral-200 dark:bg-neutral-800",
          )}
          aria-hidden
        >
          <div
            onPointerDown={handleThumbPointerDown}
            className={cn(
              "h-1.5 hover:h-2 rounded-full transition-all duration-100 cursor-grab active:cursor-grabbing",
              "bg-neutral-400 dark:bg-neutral-500 hover:bg-neutral-600 dark:hover:bg-neutral-300",
              isDraggingH && "h-2 bg-neutral-700 dark:bg-neutral-200 cursor-grabbing",
            )}
            style={{ width: horizontal.size, marginLeft: horizontal.offset }}
          />
        </div>
      )}
    </div>
  );
});
LocalScrollHoverArea.displayName = "LocalScrollHoverArea";

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = Readonly<{
  date: string;
  count: number;
}>;

export type GithubContributionCardProps = Readonly<
  {
    year?: number;
    years?: number[];
    username?: string;
    contributions?: Record<string, number> | ContributionDay[];
    onYearChange?: (year: number) => void;
  } & ComponentPropsWithoutRef<"div">
>;

const MONTHS = [
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
] as const;

const DAY_LABELS: { row: number; label: string }[] = [
  { row: 1, label: "Mon" },
  { row: 3, label: "Wed" },
  { row: 5, label: "Fri" },
];

const LEVEL_BG: Record<ContributionLevel, string> = {
  0: "bg-[#ebedf0] dark:bg-[#27272a]",
  1: "bg-[#9be9a8] dark:bg-[#0e4429]",
  2: "bg-[#40c463] dark:bg-[#006d32]",
  3: "bg-[#30a14e] dark:bg-[#26a641]",
  4: "bg-[#216e39] dark:bg-[#39d353]",
};

const LEVEL_FILL_LIGHT: Record<ContributionLevel, string> = {
  0: "#ebedf0",
  1: "#9be9a8",
  2: "#40c463",
  3: "#30a14e",
  4: "#216e39",
};

const LEVEL_FILL_DARK: Record<ContributionLevel, string> = {
  0: "#27272a",
  1: "#0e4429",
  2: "#006d32",
  3: "#26a641",
  4: "#39d353",
};

const WEEKS = 53;
const CELL = "h-[10px] w-[10px] rounded-[2px]";
const GAP = 3;
const COL = 10 + GAP;

type GraphCell = Readonly<{
  level: ContributionLevel;
  count: number;
  date: Date | null;
  inYear: boolean;
}>;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseYearFromDate(date: string): number | null {
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

function filterByYear(
  contributions: Map<string, number>,
  year: number,
): Map<string, number> {
  const prefix = `${year}-`;
  const filtered = new Map<string, number>();
  for (const [date, count] of contributions) {
    if (date.startsWith(prefix)) filtered.set(date, count);
  }
  return filtered;
}

function deriveAvailableYears(
  contributions: Map<string, number>,
  selectedYear: number,
  yearsProp?: number[],
  explicitYears?: number[],
): number[] {
  if (yearsProp?.length) {
    return [...new Set(yearsProp)].sort((a, b) => b - a);
  }
  if (explicitYears?.length) {
    return explicitYears;
  }

  const fromData = new Set<number>();
  for (const date of contributions.keys()) {
    const y = parseYearFromDate(date);
    if (y !== null) fromData.add(y);
  }
  fromData.add(selectedYear);

  const sorted = [...fromData].sort((a, b) => b - a);
  if (sorted.length > 0) {
    const min = Math.min(...sorted);
    const max = Math.max(new Date().getFullYear(), ...sorted);
    const range: number[] = [];
    for (let y = max; y >= min; y--) {
      range.push(y);
    }
    return range;
  }

  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - i);
}

function normalizeContributions(
  input?: Record<string, number> | ContributionDay[],
): Map<string, number> {
  const map = new Map<string, number>();
  if (!input) return map;

  if (Array.isArray(input)) {
    for (const { date, count } of input) {
      map.set(date, count);
    }
    return map;
  }

  for (const [date, count] of Object.entries(input)) {
    map.set(date, count);
  }
  return map;
}

function getGraphStart(year: number): Date {
  const jan1 = new Date(year, 0, 1);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function cellToDate(graphStart: Date, week: number, day: number): Date {
  const date = new Date(graphStart);
  date.setDate(graphStart.getDate() + week * 7 + day);
  return date;
}

function countToLevel(count: number, max: number): ContributionLevel {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function generateDemoContributions(year: number): Map<string, number> {
  const map = new Map<string, number>();

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const seed = year * 10_000 + month * 100 + day;

      if (month >= 3 && month <= 5) {
        if (seed % 11 === 0) continue;
        map.set(toDateKey(year, month, day), (seed % 10) + 1);
        continue;
      }

      if (seed % 9 === 0 || seed % 13 === 0) {
        map.set(toDateKey(year, month, day), (seed % 5) + 1);
      }
    }
  }

  return map;
}

function buildGraph(
  year: number,
  contributions: Map<string, number>,
): { grid: GraphCell[][]; total: number } {
  const graphStart = getGraphStart(year);
  const max = Math.max(0, ...contributions.values());
  let total = 0;

  const grid: GraphCell[][] = Array.from({ length: WEEKS }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = cellToDate(graphStart, week, day);
      const inYear = date.getFullYear() === year;

      if (!inYear) {
        return { level: 0, count: 0, date, inYear: false };
      }

      const key = toDateKey(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const count = contributions.get(key) ?? 0;
      total += count;

      return {
        level: countToLevel(count, max),
        count,
        date,
        inYear: true,
      };
    }),
  );

  return { grid, total };
}

function computeMonthLabels(year: number): { label: string; week: number }[] {
  const start = getGraphStart(year);
  const labels: { label: string; week: number }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < WEEKS; w++) {
    const date = new Date(start);
    date.setDate(start.getDate() + w * 7);
    const month = date.getMonth();
    if (month !== lastMonth) {
      labels.push({ label: MONTHS[month], week: w });
      lastMonth = month;
    }
  }

  return labels;
}

function contributionCellSrc(
  level: ContributionLevel,
  inYear: boolean,
  isDark: boolean,
): string {
  const fill = inYear
    ? isDark
      ? LEVEL_FILL_DARK[level]
      : LEVEL_FILL_LIGHT[level]
    : "transparent";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" rx="2" fill="${fill}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function formatTooltip(date: Date, count: number, username: string) {
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (count === 0) return `No contributions on ${label}`;
  return `${count} contribution${count === 1 ? "" : "s"} on ${label} — ${username}`;
}

type YearDropdownProps = Readonly<{
  years: readonly number[];
  value: number;
  onChange: (year: number) => void;
}>;

function YearDropdown({ years, value, onChange }: YearDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, open]);

  const handleSelect = (year: number) => {
    onChange(year);
    close();
  };

  return (
    <div
      ref={rootRef}
      data-slot="github-contribution-card-year-selector"
      className="relative z-20 min-w-[70px] shrink-0"
    >
      <select
        aria-label="Contribution years"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="sr-only"
        tabIndex={-1}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Contribution year, ${value}`}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-2 border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
          open
            ? "relative z-10 rounded-t-md rounded-b-none border-b-transparent bg-neutral-50 dark:bg-neutral-700"
            : "rounded-md",
        )}
      >
        <span className="tabular-nums">{value}</span>
        <span className="text-neutral-400 dark:text-neutral-500" aria-hidden>
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>

      {open ? (
        <div className="absolute top-[calc(100%-1px)] right-0 left-0 z-10 overflow-hidden rounded-b-md border border-t-0 border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <ul className="max-h-36 scrollbar-thin overflow-y-auto py-0.5">
            {years.map((year) => {
              const selected = year === value;
              return (
                <li key={year}>
                  <button
                    type="button"
                    onClick={() => handleSelect(year)}
                    className={cn(
                      "flex w-full px-2 py-1 text-left text-[11px] tabular-nums transition-colors",
                      selected
                        ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-700 dark:text-white"
                        : "text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700/60",
                    )}
                  >
                    {year}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// In-memory cache across component mounts to avoid repeated loading flicker
const contributionsCache = new Map<
  string,
  { contributions: ContributionDay[]; years: number[] }
>();

export const GithubContributionCard = forwardRef<
  HTMLDivElement,
  GithubContributionCardProps
>(
  (
    {
      className,
      year: yearProp,
      years: yearsProp,
      username = "bidyut10",
      contributions: contributionsInput,
      onYearChange,
      ...props
    },
    ref,
  ) => {
    const isDark = useIsDarkMode();
    const [internalYear, setInternalYear] = useState(
      () => yearProp ?? new Date().getFullYear(),
    );
    const selectedYear = yearProp ?? internalYear;

    const [fetchedData, setFetchedData] = useState<{
      contributions: ContributionDay[];
      years: number[];
    } | null>(() => {
      if (contributionsInput !== undefined) return null;
      if (username && contributionsCache.has(username)) {
        return contributionsCache.get(username)!;
      }
      return null;
    });

    const [isLoading, setIsLoading] = useState<boolean>(() => {
      if (contributionsInput !== undefined) return false;
      if (!username) return false;
      return !contributionsCache.has(username);
    });

    useEffect(() => {
      if (contributionsInput !== undefined || !username) {
        setIsLoading(false);
        return;
      }

      if (contributionsCache.has(username)) {
        const cached = contributionsCache.get(username)!;
        setFetchedData(cached);
        setIsLoading(false);
        return;
      }

      let isMounted = true;
      setIsLoading(true);

      const fetchContributions = async () => {
        try {
          const res = await fetch(
            `https://github-contributions-api.jogruber.de/v4/${username}`,
          );
          if (!res.ok) {
            if (isMounted) setIsLoading(false);
            return;
          }
          const data = await res.json();
          if (!isMounted) return;

          if (data?.contributions && Array.isArray(data.contributions)) {
            const yearsFound = new Set<number>();
            if (data.total && typeof data.total === "object") {
              for (const y of Object.keys(data.total)) {
                const numY = Number.parseInt(y, 10);
                if (!Number.isNaN(numY)) yearsFound.add(numY);
              }
            }
            for (const c of data.contributions) {
              if (c.date) {
                const numY = Number.parseInt(c.date.slice(0, 4), 10);
                if (!Number.isNaN(numY)) yearsFound.add(numY);
              }
            }

            const currentYear = new Date().getFullYear();
            yearsFound.add(currentYear);
            const minYear = Math.min(...yearsFound);
            const maxYear = Math.max(currentYear, ...yearsFound);

            const allYears: number[] = [];
            for (let y = maxYear; y >= minYear; y--) {
              allYears.push(y);
            }

            const result = {
              contributions: data.contributions as ContributionDay[],
              years: allYears,
            };

            contributionsCache.set(username, result);
            setFetchedData(result);
          }
        } catch {
          // Graceful fallback to demo data if offline or error
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      fetchContributions();
      return () => {
        isMounted = false;
      };
    }, [username, contributionsInput]);

    const activeContributionsInput =
      contributionsInput ?? (fetchedData?.contributions ?? undefined);

    const allContributions = useMemo(
      () => normalizeContributions(activeContributionsInput),
      [activeContributionsInput],
    );

    const hasUserData = activeContributionsInput !== undefined;

    const availableYears = useMemo(
      () =>
        deriveAvailableYears(
          allContributions,
          selectedYear,
          yearsProp,
          fetchedData?.years,
        ),
      [allContributions, selectedYear, yearsProp, fetchedData?.years],
    );

    const yearContributions = useMemo(() => {
      if (!hasUserData) return generateDemoContributions(selectedYear);
      return filterByYear(allContributions, selectedYear);
    }, [allContributions, hasUserData, selectedYear]);

    const { grid, total } = useMemo(
      () => buildGraph(selectedYear, yearContributions),
      [selectedYear, yearContributions],
    );

    const monthLabels = useMemo(
      () => computeMonthLabels(selectedYear),
      [selectedYear],
    );
    const graphWidth = WEEKS * COL - GAP;

    const handleYearSelect = (nextYear: number) => {
      if (yearProp === undefined) setInternalYear(nextYear);
      onYearChange?.(nextYear);
    };

    return (
      <div
        ref={ref}
        data-slot="github-contribution-card"
        className={cn(
          "w-full rounded-2xl border border-neutral-200/80 bg-white p-4 font-sans shadow-sm select-none dark:border-neutral-800 dark:bg-neutral-900",
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 w-44 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-6 w-16 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <LocalScrollHoverArea axis="x" className="w-full">
              <div className="inline-flex min-w-max flex-col" style={{ gap: GAP }}>
                <div
                  className="h-4"
                  style={{ width: graphWidth, marginLeft: 27 }}
                />
                <div className="flex" style={{ gap: GAP }}>
                  <div
                    className="relative shrink-0"
                    style={{ width: 24, height: 7 * COL - GAP }}
                  />
                  <div className="flex" style={{ gap: GAP }}>
                    {Array.from({ length: WEEKS }, (_, w) => (
                      <div key={w} className="flex flex-col" style={{ gap: GAP }}>
                        {Array.from({ length: 7 }, (_, d) => (
                          <div
                            key={d}
                            className={cn(
                              CELL,
                              "bg-neutral-100 dark:bg-neutral-800/80",
                            )}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </LocalScrollHoverArea>

            <div className="mt-3 flex items-center justify-end">
              <div className="h-2.5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        ) : (
          <>
            <div
              data-slot="github-contribution-card-header"
              className="relative z-10 mb-3 flex items-center justify-between gap-2"
            >
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {total.toLocaleString("en-US")}
                </span>{" "}
                contributions in {selectedYear}
              </p>

              <YearDropdown
                years={availableYears}
                value={selectedYear}
                onChange={handleYearSelect}
              />
            </div>

            <LocalScrollHoverArea axis="x" className="w-full">
              <div className="inline-flex min-w-max flex-col" style={{ gap: GAP }}>
                <div
                  className="relative h-4"
                  style={{ width: graphWidth, marginLeft: 27 }}
                >
                  {monthLabels.map(({ label, week }) => (
                    <span
                      key={`${label}-${week}`}
                      className="absolute top-0 text-[10px] text-neutral-500 dark:text-neutral-400"
                      style={{ left: week * COL }}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="flex" style={{ gap: GAP }}>
                  <div
                    className="relative shrink-0 text-[10px] text-neutral-500 dark:text-neutral-400"
                    style={{ width: 24, height: 7 * COL - GAP }}
                  >
                    {DAY_LABELS.map(({ row, label }) => (
                      <span
                        key={label}
                        className="absolute leading-none"
                        style={{ top: row * COL + 1 }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="flex" style={{ gap: GAP }}>
                    {grid.map((week) => {
                      const weekStart = week[0].date!;
                      return (
                        <div
                          key={toDateKey(
                            weekStart.getFullYear(),
                            weekStart.getMonth(),
                            weekStart.getDate(),
                          )}
                          className="flex flex-col"
                          style={{ gap: GAP }}
                          data-slot="github-contribution-card-week"
                        >
                          {week.map((cell) => {
                            const cellDate = cell.date!;
                            const tooltip = formatTooltip(
                              cellDate,
                              cell.count,
                              username,
                            );

                            return (
                              <img
                                key={toDateKey(
                                  cellDate.getFullYear(),
                                  cellDate.getMonth(),
                                  cellDate.getDate(),
                                )}
                                alt={tooltip || ""}
                                aria-hidden={!tooltip}
                                title={tooltip || undefined}
                                src={contributionCellSrc(
                                  cell.level,
                                  cell.inYear,
                                  isDark,
                                )}
                                width={10}
                                height={10}
                                className={cn(CELL, "block")}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </LocalScrollHoverArea>

            <div
              data-slot="github-contribution-card-footer"
              className="mt-2 flex items-center justify-end gap-1 text-[10px] text-neutral-500 dark:text-neutral-400"
            >
              <span>Less</span>
              {([0, 1, 2, 3, 4] as ContributionLevel[]).map((level) => (
                <div
                  key={level}
                  className={cn("h-2.5 w-2.5 rounded-xs", LEVEL_BG[level])}
                />
              ))}
              <span>More</span>
            </div>
          </>
        )}
      </div>
    );
  },
);

GithubContributionCard.displayName = "GithubContributionCard";
