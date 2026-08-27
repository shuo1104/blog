import { forwardRef, useState, useEffect, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/app/components/ui/utils";
import { Play, Pause, SkipForward, SkipBack, Music2, Minimize2 } from "lucide-react";

export type Track = {
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
};

const DEFAULT_PLAYLIST: Track[] = [
  {
    title: "Midnight Dreams",
    artist: "The Weeknd",
    artwork: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=120&auto=format&fit=crop&q=80",
    duration: 210,
  },
  {
    title: "Serene Reverie",
    artist: "Shuo",
    artwork: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80",
    duration: 185,
  },
  {
    title: "Tokyo Rain (Lo-Fi)",
    artist: "Komorebi",
    artwork: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=120&auto=format&fit=crop&q=80",
    duration: 160,
  },
];

export type NowPlayingBarProps = Readonly<
  {
    title?: string;
    artist?: string;
    progress?: number;
    artwork?: string;
    defaultPlaying?: boolean;
    defaultCollapsed?: boolean;
    playlist?: Track[];
    onPlayChange?: (isPlaying: boolean) => void;
  } & ComponentPropsWithoutRef<"div">
>;

export const NowPlayingBar = forwardRef<HTMLDivElement, NowPlayingBarProps>(
  (
    {
      className,
      title: initialTitle,
      artist: initialArtist,
      progress: initialProgress = 35,
      artwork: initialArtwork,
      defaultPlaying = true,
      defaultCollapsed = false,
      playlist = DEFAULT_PLAYLIST,
      onPlayChange,
      ...props
    },
    ref,
  ) => {
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [playing, setPlaying] = useState(defaultPlaying);
    const [progress, setProgress] = useState(initialProgress);
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    const currentTrack = playlist[currentTrackIndex] || {
      title: initialTitle || "Midnight Dreams",
      artist: initialArtist || "The Weeknd",
      artwork: initialArtwork,
    };

    const title = initialTitle && !playlist[currentTrackIndex] ? initialTitle : currentTrack.title;
    const artist = initialArtist && !playlist[currentTrackIndex] ? initialArtist : currentTrack.artist;
    const artwork = initialArtwork && !playlist[currentTrackIndex] ? initialArtwork : currentTrack.artwork;

    // Simulate playback progression
    useEffect(() => {
      if (!playing) return;

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentTrackIndex((idx) => (idx + 1) % playlist.length);
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);

      return () => clearInterval(interval);
    }, [playing, playlist.length]);

    const togglePlay = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const next = !playing;
      setPlaying(next);
      onPlayChange?.(next);
    };

    const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentTrackIndex((idx) => (idx + 1) % playlist.length);
      setProgress(0);
    };

    const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentTrackIndex((idx) => (idx - 1 + playlist.length) % playlist.length);
      setProgress(0);
    };

    return (
      <div
        ref={ref}
        data-slot="now-playing-bar"
        className={cn(
          "group relative flex items-center select-none font-sans overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "border border-neutral-200/90 bg-white/95 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.14),0_4px_12px_rgba(0,0,0,0.06)] backdrop-blur-md",
          "dark:border-white/10 dark:bg-neutral-950/95 dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7),0_0_1px_1px_rgba(255,255,255,0.05)]",
          collapsed
            ? "h-12 w-12 rounded-full p-1 cursor-pointer hover:scale-105 active:scale-95"
            : "h-[54px] w-72 sm:w-80 rounded-2xl p-2 sm:px-2.5",
          className
        )}
        onClick={collapsed ? () => setCollapsed(false) : undefined}
        title={collapsed ? `${title} - ${artist} (点击展开播放器)` : undefined}
        {...props}
      >
        {/* Album Artwork */}
        <div
          onClick={!collapsed ? (e) => { e.stopPropagation(); setCollapsed(true); } : undefined}
          title={!collapsed ? "点击收起播放器" : undefined}
          className={cn(
            "relative shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/10 transition-all duration-300",
            collapsed
              ? "h-full w-full rounded-full"
              : "h-9 w-9 sm:h-10 sm:w-10 rounded-xl cursor-pointer hover:opacity-85 active:scale-95"
          )}
        >
          {artwork ? (
            <img
              src={artwork}
              alt={title}
              className={cn(
                "h-full w-full object-cover transition-transform duration-500",
                playing && collapsed ? "animate-[spin_10s_linear_infinite]" : "",
                playing && !collapsed ? "scale-105" : ""
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-600">
              <Music2 size={16} />
            </div>
          )}

          {/* Collapsed Center Vinyl Hole */}
          {collapsed && (
            <div className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-white/90 dark:bg-neutral-950/90 border border-black/10 dark:border-white/20 shadow-xs" />
          )}

          {/* Equalizer Wavelet Indicator */}
          {playing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5 pointer-events-none">
              <span className="w-0.5 h-2.5 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-0.5 h-3.5 bg-white rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 h-2 bg-white rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.4s]" />
            </div>
          )}
        </div>

        {/* Expanded Content (Info, Controls, Collapse button) */}
        <div
          className={cn(
            "flex items-center gap-2 min-w-0 flex-1 pl-2 transition-all duration-200",
            collapsed
              ? "opacity-0 pointer-events-none w-0 max-w-0 overflow-hidden invisible"
              : "opacity-100 visible w-auto"
          )}
        >
          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-neutral-900 dark:text-white leading-tight">
              {title}
            </p>
            <p className="truncate text-[10.5px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
              {artist}
            </p>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              aria-label="Previous track"
              onClick={handlePrev}
              className="cursor-pointer p-1 text-neutral-400 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white active:scale-90"
            >
              <SkipBack size={13} />
            </button>

            <button
              type="button"
              aria-label={playing ? "Pause" : "Play"}
              onClick={togglePlay}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-xs transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-neutral-900"
            >
              {playing ? (
                <Pause size={12} className="fill-current" />
              ) : (
                <Play size={12} className="fill-current translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              aria-label="Next track"
              onClick={handleNext}
              className="cursor-pointer p-1 text-neutral-400 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white active:scale-90"
            >
              <SkipForward size={13} />
            </button>

            {/* Collapse / Minimize Button */}
            <button
              type="button"
              aria-label="Collapse player"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(true);
              }}
              title="收起播放器"
              className="cursor-pointer p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white active:scale-90 transition-colors ml-0.5"
            >
              <Minimize2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

NowPlayingBar.displayName = "NowPlayingBar";
