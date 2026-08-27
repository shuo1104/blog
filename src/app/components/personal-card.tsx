import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "./ui/utils";
import { Mail, Globe, AtSign, X } from "lucide-react";




export interface PersonalCardProps {
  name?: string;
  title?: string;
  tagline?: string;
  email?: string;
  handle?: string;
  website?: string;
  edition?: string;
  year?: string;
  monogram?: string;
  avatarUrl?: string;
  className?: string;
}

export function PersonalCard({
  name = "Shuo",
  title = "AI Development Engineer",
  tagline = "Creating everything with AI · Nice to meet you",
  email = "shuode9131@gmail.com",
  handle = "@shuo",
  website = "shuo.dev",
  edition = "AI EDITION · SER. 0913",
  year = "EST. 2026",
  monogram = "S",
  className,
}: PersonalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apple-inspired smooth spring physics
  const springConfig = { damping: 24, stiffness: 220, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [11, -11]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-13, 13]), springConfig);

  // Dynamic light glare position
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [10, 90]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, 90]), springConfig);
  const glareOpacity = useSpring(isHovered ? 0.65 : 0, { damping: 20, stiffness: 150 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        "perspective-[1200px]",
        className
      )}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={cn(
          "relative w-full max-w-[440px] min-h-[250px] sm:min-h-0 sm:aspect-[1.62/1] rounded-[20px] sm:rounded-[22px]",
          "cursor-grab active:cursor-grabbing",
          "p-4 sm:p-6 sm:p-7 flex flex-col justify-between overflow-hidden",
          "transition-shadow duration-300 ease-out",
          // Base Titanium styling
          "bg-gradient-to-br from-[#f8f9fb] via-[#e2e6eb] to-[#cbd2da]",
          "dark:from-[#2a2d33] dark:via-[#1e2024] dark:to-[#141619]",
          // Micro metallic bezel & deep realistic shadows
          "border border-white/80 dark:border-white/15",
          "shadow-[0_22px_45px_-12px_rgba(0,0,0,0.22),0_8px_16px_-6px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.15)]",
          "dark:shadow-[0_28px_50px_-10px_rgba(0,0,0,0.65),0_12px_24px_-8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.6)]"
        )}
      >
        {/* Fine Brushed Metal Texture Overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px] sm:rounded-[22px] opacity-45 dark:opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.03) 0px,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 2px,
              transparent 4px
            ), repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.04) 0px,
              rgba(0, 0, 0, 0.03) 1px,
              transparent 2px,
              transparent 3px
            )`,
          }}
        />

        {/* Dynamic Specular Glare (Follows Cursor) */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[20px] sm:rounded-[22px] z-30 transition-opacity duration-200"
          style={{
            opacity: glareOpacity,
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle 320px at ${gx}% ${gy}%, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.15) 35%, transparent 70%)`
            ),
          }}
        />

        {/* Subtle Anisotropic Light Sheen */}
        <div
          className="pointer-events-none absolute -inset-full opacity-35 dark:opacity-15"
          style={{
            background:
              "conic-gradient(from 45deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.4) 60deg, transparent 120deg, rgba(255,255,255,0.3) 240deg, transparent 360deg)",
          }}
        />

        {/* Right Watermark: Laser-Debossed Monogram & Geometric Rings */}
        <div
          className="pointer-events-none absolute -right-6 -bottom-8 w-56 h-56 rounded-full flex items-center justify-center opacity-[0.07] dark:opacity-[0.09] z-0"
          style={{ transform: "translateZ(8px)" }}
        >
          {/* Concentric etched arcs */}
          <div className="absolute inset-0 rounded-full border-[12px] border-neutral-900 dark:border-white" />
          <div className="absolute inset-6 rounded-full border-[6px] border-dashed border-neutral-900 dark:border-white" />
          <div className="absolute inset-14 rounded-full border-[2px] border-neutral-900 dark:border-white" />
          <span
            className="font-serif text-8xl font-bold tracking-tighter text-neutral-900 dark:text-white"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {monogram}
          </span>
        </div>

        {/* TOP ROW: Name & Title (Top-Left) + Monogram Badge (Top-Right) */}
        <div
          className="relative z-10 flex items-start justify-between gap-3 mb-auto"
          style={{ transform: "translateZ(38px)" }}
        >
          <div className="flex flex-col">
            <h2
              className="text-xl sm:text-2xl md:text-[1.75rem] font-semibold tracking-[-0.025em] leading-tight text-neutral-900 dark:text-neutral-50 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] antialiased select-text"
              style={{
                fontFamily: "Fraunces, 'Newsreader', Georgia, serif",
                fontFeatureSettings: "'opsz' 36, 'calt' 1, 'liga' 1",
              }}
            >
              {name}
            </h2>

            <p className="mt-0.5 text-[11.5px] sm:text-[13px] font-sans font-medium tracking-tight text-neutral-600 dark:text-neutral-300/90 antialiased">
              {title}
            </p>

            {tagline && (
              <p
                className="mt-0.5 text-[10.5px] sm:text-xs text-neutral-500 dark:text-neutral-400/80 italic font-serif tracking-normal line-clamp-1 antialiased"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                {tagline}
              </p>
            )}
          </div>

          {/* Top-Right Monogram Badge */}
          <div
            className="flex items-center shrink-0 pt-0.5"
            style={{ transform: "translateZ(32px)" }}
          >
            <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-neutral-400/30 dark:border-neutral-500/30 bg-neutral-200/60 dark:bg-neutral-800/60 backdrop-blur-xs shadow-inner transition-colors hover:border-neutral-500/50">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.18em] text-neutral-700 dark:text-neutral-200 uppercase tabular-nums">
                {monogram}
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Left-Aligned Vinyl Graffiti Sticker "HELLO!" */}
        <div
          className="relative z-20 my-auto flex items-center justify-start py-1 sm:py-1.5 pl-0.5 select-none"
          style={{ transform: "translateZ(46px)" }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="relative cursor-pointer select-none"
          >
            {/* Sticker Die-Cut Container */}
            <div className="relative -rotate-[3.5deg] rounded-xl sm:rounded-2xl bg-gradient-to-br from-white via-neutral-100 to-neutral-200 dark:from-[#20232a] dark:via-[#181a1f] dark:to-[#121316] px-3.5 py-1 sm:px-5 sm:py-2 border-2 border-white dark:border-neutral-700/80 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.25),0_4px_12px_-2px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,1)] dark:shadow-[0_16px_32px_-6px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              {/* Glossy Vinyl Highlight Overlay */}
              <div className="pointer-events-none absolute inset-x-2 top-0.5 sm:top-1 h-2 sm:h-3 rounded-t-xl bg-gradient-to-b from-white/70 to-transparent dark:from-white/15 opacity-80" />

              {/* Graffiti Lettering & Accents */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span
                  className="font-black text-lg sm:text-2xl md:text-3xl tracking-wider uppercase bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-neutral-300 bg-clip-text text-transparent drop-shadow-[0_2px_0_rgba(0,0,0,0.15)] dark:drop-shadow-[0_2px_0_rgba(0,0,0,0.85)]"
                  style={{
                    fontFamily: "Impact, 'Arial Black', -apple-system, sans-serif",
                    letterSpacing: "0.06em",
                    transform: "skew(-5deg)",
                  }}
                >
                  HELLO!
                </span>

                {/* Street Graffiti Sparkle / Star */}
                <span className="text-amber-500 dark:text-amber-400 text-sm sm:text-base font-bold select-none">
                  ✦
                </span>
              </div>

              {/* Little peel-tag / serial accent on corner */}
              <div className="absolute -bottom-1 -right-1 px-1 sm:px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-[7px] sm:text-[8px] font-mono font-bold text-white dark:text-neutral-900 rotate-6 shadow-xs">
                № 0429
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM ROW: Contact Links & Technical Edition Metadata */}
        <div
          className="relative z-10 flex items-end justify-between border-t border-neutral-400/20 dark:border-neutral-600/30 pt-2.5 sm:pt-3 mt-auto"
          style={{ transform: "translateZ(26px)" }}
        >
          {/* Left: Contact Info */}
          <div className="flex flex-col gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-sans text-neutral-600 dark:text-neutral-300">
            {email && (
              <div className="group flex items-center gap-1.5 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer">
                <Mail className="size-2.5 sm:size-3 text-neutral-400 dark:text-neutral-500 shrink-0 group-hover:text-neutral-800 dark:group-hover:text-neutral-300 transition-colors" />
                <span className="font-mono tracking-tight text-[9.5px] sm:text-[10.5px] group-hover:underline underline-offset-2 transition-all">
                  {email}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              {handle && (
                <div className="group flex items-center gap-1 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer">
                  <AtSign className="size-2.5 sm:size-3 text-neutral-400 dark:text-neutral-500 shrink-0 group-hover:text-neutral-800 dark:group-hover:text-neutral-300 transition-colors" />
                  <span className="font-mono text-[9.5px] sm:text-[10.5px] group-hover:underline underline-offset-2 transition-all">
                    {handle}
                  </span>
                </div>
              )}
              {website && (
                <div className="group flex items-center gap-1 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer">
                  <Globe className="size-2.5 sm:size-3 text-neutral-400 dark:text-neutral-500 shrink-0 group-hover:text-neutral-800 dark:group-hover:text-neutral-300 transition-colors" />
                  <span className="font-mono text-[9.5px] sm:text-[10.5px] group-hover:underline underline-offset-2 transition-all">
                    {website}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Edition & Year */}
          <div className="flex flex-col items-end text-right select-none">
            <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-neutral-400 dark:text-neutral-500 font-semibold tabular-nums">
              {edition}
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.14em] text-neutral-600 dark:text-neutral-300 font-medium mt-0.5 tabular-nums">
              {year}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export interface PersonalCardModalProps extends PersonalCardProps {
  isOpen?: boolean;
  onClose?: () => void;
  autoOpenOnFirstVisit?: boolean;
}

export function PersonalCardModal({
  isOpen = true,
  onClose,
  ...cardProps
}: PersonalCardModalProps) {
  // Listen for ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md"
          />

          {/* Card Container with Spring Pop-in Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 280,
              mass: 0.85,
            }}
            className="relative z-10 flex flex-col items-center max-w-lg w-full"
          >
            {/* Close button on top-right */}
            {onClose && (
              <motion.button
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                onClick={onClose}
                aria-label="Close business card"
                className="self-end mb-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-neutral-800/80 backdrop-blur-md border border-neutral-300/60 dark:border-neutral-700/60 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
              >
                <span>Dismiss</span>
                <X className="size-3.5" />
              </motion.button>
            )}

            {/* The 3D Interactive Titanium Card */}
            <div className="w-full">
              <PersonalCard {...cardProps} />
            </div>

            {/* Interactive hint under card */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-4 text-center font-mono text-[11px] text-neutral-500/90 dark:text-neutral-400/90 tracking-wide flex items-center justify-center gap-1.5"
            >
              <span>✦ Hover & move cursor to tilt 3D card</span>
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
