"use client";

import React, { useState } from "react";
import {
  MapPin,
  Link2,
  Calendar,
  CheckCircle2,
  Mail,
  Twitter,
  Github,
  Rss,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./utils";

export interface TwitterProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  following?: number | string;
  followers?: number | string;
  coverImage?: string;
  avatarImage?: string;
  email?: string;
  github?: string;
  rss?: string;
}

export function TwitterProfileCard({
  className,
  name = "Shuo",
  username = "@shuo",
  bio = "AI Development Engineer · Creating everything with AI. Nice to meet you.",
  location = "San Francisco, CA",
  website = "shuo.dev",
  joinedDate = "Joined March 2026",
  following = "418",
  followers = "14.2K",
  coverImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  avatarImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  email = "shuode9131@gmail.com",
  github = "github.com/shuo1104",
  rss = "shuo.dev/rss.xml",
  ...props
}: TwitterProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div
      data-slot="twitter-profile-card"
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/90",
        className
      )}
      {...props}
    >
      {/* Cover Image Banner */}
      <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={coverImage}
          alt="Profile Banner"
          className="h-full w-full object-cover brightness-[0.92] dark:brightness-[0.75] transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="relative px-6 pb-6 pt-0">
        {/* Avatar & Action Button Row */}
        <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-4">
          {/* Overlapping Avatar */}
          <div className="relative">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-4 border-white bg-neutral-200 shadow-md dark:border-neutral-900 dark:bg-neutral-800">
              <img
                src={avatarImage}
                alt={name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-1 rounded-full bg-emerald-500 p-1 ring-2 ring-white dark:ring-neutral-900" title="Online / Active">
              <div className="size-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* Follow / Connect Button */}
          <button
            type="button"
            onClick={() => setIsFollowing(!isFollowing)}
            className={cn(
              "cursor-pointer select-none rounded-full px-5 py-2 text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 shadow-xs active:scale-95",
              isFollowing
                ? "border border-neutral-300 bg-transparent text-neutral-800 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            )}
          >
            {isFollowing ? "Following" : "Follow on X"}
          </button>
        </div>

        {/* Name, Verified Badge & Handle */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <h3
              className="text-lg sm:text-xl font-semibold text-foreground tracking-tight"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {name}
            </h3>
            <CheckCircle2 className="size-4.5 text-blue-500 fill-blue-500/20" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono">{username}</p>
        </div>

        {/* Bio Text */}
        <p className="mb-4 text-sm text-foreground/85 leading-relaxed font-normal">
          {bio}
        </p>

        {/* Location, Website & Join Date Details */}
        <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {location}
            </span>
          )}
          {website && (
            <a
              href={`https://${website}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground hover:underline underline-offset-4"
            >
              <Link2 className="size-3.5" />
              {website}
            </a>
          )}
          {joinedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {joinedDate}
            </span>
          )}
        </div>

        {/* Follower & Following Stats */}
        <div className="mb-6 flex items-center gap-6 border-y border-border/50 py-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{following}</span>
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-foreground">{followers}</span>
            <span className="text-muted-foreground">Followers</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground font-mono">
            <Sparkles className="size-3 text-amber-500" />
            <span>Active Creator</span>
          </div>
        </div>

        {/* Elsewhere & Connect Quick Direct Access Grid */}
        <div>
          <h4 className="mb-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Direct Connect & Feeds
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="group flex items-center justify-between rounded-xl border border-border/60 bg-neutral-50/50 p-2.5 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100/80 dark:bg-neutral-850/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
                  <Mail className="size-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground font-medium">Email</span>
                  <span className="truncate text-xs font-semibold text-foreground">{email}</span>
                </div>
              </div>
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </a>

            {/* Twitter / X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-xl border border-border/60 bg-neutral-50/50 p-2.5 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100/80 dark:bg-neutral-850/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="rounded-lg bg-neutral-900/10 dark:bg-white/10 p-1.5 text-neutral-900 dark:text-white">
                  <Twitter className="size-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground font-medium">Twitter / X</span>
                  <span className="truncate text-xs font-semibold text-foreground">{username}</span>
                </div>
              </div>
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </a>

            {/* GitHub */}
            <a
              href={`https://${github}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-xl border border-border/60 bg-neutral-50/50 p-2.5 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100/80 dark:bg-neutral-850/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-600 dark:text-purple-400">
                  <Github className="size-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground font-medium">GitHub</span>
                  <span className="truncate text-xs font-semibold text-foreground">{github}</span>
                </div>
              </div>
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </a>

            {/* RSS Feed */}
            <a
              href="#"
              className="group flex items-center justify-between rounded-xl border border-border/60 bg-neutral-50/50 p-2.5 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100/80 dark:bg-neutral-850/40 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="rounded-lg bg-orange-500/10 p-1.5 text-orange-600 dark:text-orange-400">
                  <Rss className="size-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-muted-foreground font-medium">RSS Feed</span>
                  <span className="truncate text-xs font-semibold text-foreground">{rss}</span>
                </div>
              </div>
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwitterProfileCard;
