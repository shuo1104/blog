import {
  useEffect,
  useState,
  useCallback,
  type ComponentPropsWithoutRef,
} from "react";
import { flushSync } from "react-dom";
import { Sun, Moon } from "lucide-react";
import { cn } from "./ui/utils";

export type ThemeToggleProps = ComponentPropsWithoutRef<"button">;

// FollowButton layer transition: Both icons stack in the same grid cell so dimensions never shift.
// Outgoing icon fades/scales down first; incoming icon fades/scales in after a short delay.
const ICON_LAYER =
  "col-start-1 row-start-1 flex items-center justify-center transition-all ease-out motion-reduce:transition-none";

// Tactile 3D theme toggle adopting OpenSourceUI FollowButton keycap styling & interaction
export function ThemeToggle({ className, onClick, ...props }: ThemeToggleProps) {
  // 1. Initial State: Default follows system unless manually toggled
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 2. Real-time OS System theme tracking (active when user has not manually locked theme)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme");
      if (!stored || stored === "system") {
        setIsDark(e.matches);
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const applyTheme = useCallback((nextDark: boolean) => {
    setIsDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("theme", nextDark ? "dark" : "light");
  }, []);

  // 3. Apple-style smooth 0.25s cross-fade transition
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextDark = !isDark;

    const supportsVT =
      typeof document !== "undefined" && "startViewTransition" in document;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!supportsVT || reduceMotion) {
      applyTheme(nextDark);
      onClick?.(e);
      return;
    }

    (document as any).startViewTransition(() => {
      flushSync(() => {
        applyTheme(nextDark);
      });
    });

    onClick?.(e);
  };

  return (
    <button
      type="button"
      aria-label={isDark ? "切换为浅色模式" : "切换为深色模式"}
      title={isDark ? "当前为深色模式（点击切换为浅色）" : "当前为浅色模式（点击切换为深色）"}
      aria-pressed={isDark}
      data-slot="theme-toggle"
      onClick={handleToggle}
      className={cn(
        "grid h-8.5 w-8.5 sm:h-9 sm:w-9 cursor-pointer place-items-stretch rounded-full outline-none select-none",
        "transition-[background-color,box-shadow,color,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white",
        isDark
          ? cn(
              // Dark 3D keycap: deep lift + bottom recess + soft top sheen (from FollowButton)
              "bg-neutral-900 text-neutral-100 hover:bg-neutral-800",
              "shadow-[0_1px_1px_rgba(0,0,0,0.35),0_3px_6px_rgba(0,0,0,0.28),0_8px_16px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.18),inset_0_-3px_6px_rgba(0,0,0,0.55)]",
              "active:bg-neutral-950 active:scale-95 active:shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_2px_6px_rgba(0,0,0,0.55),inset_0_-1px_1px_rgba(255,255,255,0.06)]",
            )
          : cn(
              // Light raised keycap: soft blurred highlight + subtle bevel (from FollowButton)
              "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.08)]",
              "active:bg-neutral-100 active:scale-95 active:shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(0,0,0,0.04),inset_0_-1px_2px_rgba(0,0,0,0.05)]",
            ),
        className,
      )}
      {...props}
    >
      {/* Sun Icon (Light Mode) */}
      <span
        aria-hidden={isDark}
        className={cn(
          ICON_LAYER,
          isDark
            ? "opacity-0 scale-75 duration-200"
            : "opacity-100 scale-100 duration-300 delay-150 text-amber-500",
        )}
      >
        <Sun size={17} strokeWidth={2} aria-hidden />
      </span>

      {/* Moon Icon (Dark Mode) */}
      <span
        aria-hidden={!isDark}
        className={cn(
          ICON_LAYER,
          isDark
            ? "opacity-100 scale-100 duration-300 delay-150 text-sky-400"
            : "opacity-0 scale-75 duration-200",
        )}
      >
        <Moon size={17} strokeWidth={2} aria-hidden />
      </span>
    </button>
  );
}

export default ThemeToggle;
