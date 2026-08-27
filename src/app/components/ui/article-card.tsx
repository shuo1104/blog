"use client";

import React, { useState } from "react";
import { Link } from "react-router";
import {
  Heart,
  BarChart2,
  Bookmark,
  Share2,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { type Post } from "../../data/posts";
import { useEngagement } from "../../services/engagement-service";
import { cn } from "./utils";

interface ArticleCardProps {
  post: Post;
  lang?: "en" | "zh";
  className?: string;
}

export function ArticleCard({ post, lang = "en", className }: ArticleCardProps) {
  const current = lang === "zh" && post.zh ? post.zh : (post.en || post);
  const { liked, likesCount, sharesCount, viewsCount, copied, toggleLike, shareLink } = useEngagement(post.slug);

  const fallbackImages: Record<string, string> = {
    "on-writing-less": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    "small-tools-big-leverage": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    "the-quiet-hours": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80",
    "notes-on-taste": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
  };

  const coverImage =
    post.coverImage ||
    fallbackImages[post.slug] ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarked((prev) => !prev);
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const displayExcerpt =
    current.excerpt ||
    (current.sections && current.sections[0]?.paragraphs[0]) ||
    (current.content && current.content[0]) ||
    "A reflective essay on craft, clarity, and deliberate digital restraint.";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/80",
        "bg-neutral-50/40 dark:bg-neutral-900/40 backdrop-blur-xs shadow-xs hover:shadow-md",
        "dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]",
        "transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      <Link to={`/post/${post.slug}`} className="block flex-1">
        {/* Compact Cover Image Banner */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={coverImage}
            alt={current.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          {/* Soft Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Bottom-right: Reading time */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center">
            <div className="rounded-md bg-black/60 px-2 py-0.5 text-[10.5px] font-medium text-white/90 backdrop-blur-md border border-white/15 font-mono">
              {current.readingTime || post.readingTime || "4 min"}
            </div>
          </div>
        </div>

        {/* Card Body - Compact & Tight */}
        <div className="p-5 flex flex-col gap-2.5">
          {/* Main Title */}
          <h2
            className="text-lg sm:text-[1.25rem] font-medium tracking-tight text-foreground group-hover:text-foreground/80 transition-colors leading-[1.3] line-clamp-2"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {current.title}
          </h2>

          {/* Article Theme & Story Excerpt (2 Lines) */}
          <p
            className="text-muted-foreground text-xs sm:text-[13px] leading-relaxed font-normal line-clamp-2"
            style={{ lineHeight: 1.6 }}
          >
            {displayExcerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-neutral-200/50 dark:bg-neutral-800/80 px-2 py-0.5 text-[10.5px] font-mono text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      {/* Compact Interactive Social Action Footer (Real Backend Sync) */}
      <div className="border-t border-border/30 px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between text-[11px] text-muted-foreground select-none bg-neutral-100/30 dark:bg-neutral-850/30">
        {/* Left Metric Buttons */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Likes (Interactive & Backend Persistent) */}
          <button
            type="button"
            onClick={toggleLike}
            className={cn(
              "group/action flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.92]",
              liked ? "text-red-500 font-medium" : "hover:text-red-500 text-muted-foreground"
            )}
            title={liked ? "Liked!" : "Like article"}
          >
            <motion.div whileTap={{ scale: 1.25 }}>
              <Heart
                className={cn(
                  "size-3.5 transition-transform",
                  liked ? "fill-red-500 text-red-500" : ""
                )}
              />
            </motion.div>
            <span className="font-mono">{formatCount(likesCount)}</span>
          </button>

          {/* Shares (Interactive & Backend Persistent Copy Link) */}
          <button
            type="button"
            onClick={shareLink}
            className="group/action flex items-center gap-1.5 hover:text-foreground active:scale-[0.92] transition-all cursor-pointer text-muted-foreground"
            title="Copy link to share"
          >
            <Share2 className="size-3.5" />
            <span className="font-mono">{formatCount(sharesCount)}</span>
          </button>

          {/* Views / Impressions */}
          <div
            className="flex items-center gap-1.5 text-muted-foreground/80"
            title="Total Views"
          >
            <BarChart2 className="size-3.5" />
            <span className="font-mono">{formatCount(viewsCount)}</span>
          </div>
        </div>

        {/* Right Action Icons: Bookmark & Share Link */}
        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmark}
            title={bookmarked ? "Saved to bookmarks" : "Bookmark article"}
            className={cn(
              "cursor-pointer rounded p-1 transition-all hover:bg-neutral-200/50 active:scale-[0.92] dark:hover:bg-neutral-800",
              bookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark
              className={cn(
                "size-3.5 transition-transform",
                bookmarked ? "fill-current" : ""
              )}
            />
          </button>

          {/* Share & Copy Link */}
          <button
            type="button"
            onClick={shareLink}
            title={copied ? "Copied!" : "Copy link"}
            className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground hover:bg-neutral-200/50 active:scale-[0.92] dark:hover:bg-neutral-800 transition-all flex items-center gap-1"
          >
            {copied ? (
              <span className="text-emerald-500 font-mono text-[10px] flex items-center gap-0.5">
                <Check className="size-3 text-emerald-500" />
                <span>Copied</span>
              </span>
            ) : (
              <Share2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ArticleCard;
