"use client";

import React, { useState } from "react";
import {
  Mail,
  Twitter,
  Github,
  Rss,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./utils";

export interface SocialCardItem {
  id: "email" | "twitter" | "github" | "rss";
  type: string;
  name: string;
  handle: string;
  bio: string;
  coverGradient: string;
  coverImage?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badge?: string;
  verified?: boolean;
  stats: { label: string; value: string }[];
  actionLabel: string;
  href: string;
}

export const SOCIAL_PROFILES: SocialCardItem[] = [
  {
    id: "email",
    type: "Email Inbox",
    name: "Shuo",
    handle: "shuode9131@gmail.com",
    bio: "AI Development Engineer · Creating everything with AI. Reach out for consulting, agent systems, and ideas.",
    coverGradient: "from-blue-600/30 via-indigo-600/20 to-slate-900/60",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80",
    icon: Mail,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/15",
    badge: "< 24h Response",
    verified: true,
    stats: [
      { label: "Response", value: "< 24h" },
      { label: "Read Rate", value: "100%" } ,
      { label: "PGP Encryption", value: "Supported" },
    ],
    actionLabel: "Send Email",
    href: "mailto:shuode9131@gmail.com",
  },
  {
    id: "twitter",
    type: "Twitter / X",
    name: "Shuo",
    handle: "@shuo",
    bio: "AI Development Engineer · Creating everything with AI. Sharing thoughts on LLM systems, agents, and craft.",
    coverGradient: "from-neutral-700/40 via-neutral-800/30 to-black/70",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    icon: Twitter,
    iconColor: "text-neutral-900 dark:text-white",
    iconBg: "bg-neutral-900/10 dark:bg-white/10",
    badge: "Active Daily",
    verified: true,
    stats: [
      { label: "Followers", value: "14.2K" },
      { label: "Following", value: "418" },
      { label: "Posts", value: "1.2K" },
    ],
    actionLabel: "Follow on X",
    href: "https://twitter.com",
  },
  {
    id: "github",
    type: "GitHub Developer",
    name: "Shuo",
    handle: "github.com/shuo1104",
    bio: "Open-source AI tools, minimal components, and independent software engineering.",
    coverGradient: "from-purple-700/30 via-indigo-800/20 to-slate-950/70",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    icon: Github,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/15",
    badge: "Active Projects",
    verified: true,
    stats: [
      { label: "Public Commits", value: "155" },
      { label: "Primary Lang", value: "TypeScript / Python" },
      { label: "Status", value: "Active Builder" },
    ],
    actionLabel: "View GitHub",
    href: "https://github.com/shuo1104",
  },
  {
    id: "rss",
    type: "RSS Feed",
    name: "Shuo's Journal RSS",
    handle: "shuo.dev/rss.xml",
    bio: "Clean XML syndication with zero trackers, no ads, and complete full-text markdown essays.",
    coverGradient: "from-orange-600/30 via-amber-600/20 to-stone-900/60",
    coverImage: "https://images.unsplash.com/photo-1507842229451-7f01be8510d2?w=600&auto=format&fit=crop&q=80",
    icon: Rss,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-500/15",
    badge: "Full Text Feed",
    verified: true,
    stats: [
      { label: "Format", value: "XML / JSON" },
      { label: "Frequency", value: "Bi-weekly" },
      { label: "Trackers", value: "Zero" },
    ],
    actionLabel: "Subscribe RGS",
    href: "#",
  },
];

export function SocialProfileCard({ item }: { item: SocialCardItem }) {
  const [followed, setFollowed] = React.useState(false);
  const Icon = item.icon;

  const handleAction = (e: React.MouseEvent) => {
    if (item.id === "twitter") {
      e.preventDefault();
      setFollowed(!followed);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/95 shadow-xs transition-all duration-300 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/95 dark:hover:border-neutral-700"
    >
      {/* Cover Image with Vignette & Gradient */}
      <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.name}
            className="h-full w-full object-cover brightness-[0.92] dark:brightness-[0.75] transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={cn("h-full w-full bg-gradient-to-r", item.coverGradient)} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top Right Tag Badge */}
        <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md border border-white/10">
          {item.type}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-0">
        {/* Overlapping Icon Avatar + Action Button */}
        <div className="flex items-end justify-between -mt-9 sm:-mt-10 mb-3">
          {/* Overlapping Profile Icon Avatar */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-white shadow-md dark:border-neutral-900 dark:bg-neutral-850">
              <div className={cn("flex h-full w-full items-center justify-center rounded-[14px]", item.iconBg)}>
                <Icon className={cn("size-7", item.iconColor)} />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 p-1 ring-2 ring-white dark:ring-neutral-900">
              <div className="size-1.5 rounded-full bg-white" />
            </div>
          </div>



          <a
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
            onClick={handleAction}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-tight transition-all duration-200 shadow-xs cursor-pointer select-none active:scale-95",
              item.id === "twitter" && followed
                ? "border border-neutral-300 bg-transparent text-neutral-800 dark:border-neutral-700 dark:text-neutral-200"
                : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            )}
          >
            <span>{item.id === "twitter" && followed ? "Following" : item.actionLabel}</span>
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>


        <div className="mb-2.5">
          <div className="flex items-center gap-1.5">
            <h3
              className="text-base sm:text-lg font-semibold text-foreground tracking-tight"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {item.name}
            </h3>
            {item.verified && (
              <CheckCircle2 className="size-4 text-blue-500 fill-blue-500/20" />
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">{item.handle}</p>
        </div>


        <p className="mb-4 flex-1 text-xs sm:text-sm text-foreground/80 leading-relaxed font-normal">
          {item.bio}
        </p>


        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-[11px] sm:text-xs text-muted-foreground">
          {item.stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="font-bold text-foreground tracking-tight">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground/80">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default SocialProfileCard;