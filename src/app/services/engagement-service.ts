"use client";

import { useState, useEffect, useCallback } from "react";

export interface ArticleEngagement {
  likes: number;
  shares: number;
  views: number;
}

const DEFAULT_STATS: Record<string, ArticleEngagement> = {
  "on-writing-less": { likes: 1240, shares: 412, views: 18450 },
  "small-tools-big-leverage": { likes: 890, shares: 285, views: 14200 },
  "the-quiet-hours": { likes: 480, shares: 196, views: 9480 },
  "notes-on-typography": { likes: 235, shares: 114, views: 6160 },
};

let globalEngagementCache: Record<string, ArticleEngagement> = { ...DEFAULT_STATS };
let hasFetchedGlobal = false;

async function fetchGlobalEngagement() {
  if (hasFetchedGlobal) return;
  try {
    const res = await fetch("/api/engagement");
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") {
        globalEngagementCache = { ...DEFAULT_STATS, ...data };
        hasFetchedGlobal = true;
        window.dispatchEvent(new CustomEvent("engagement-sync", { detail: globalEngagementCache }));
      }
    }
  } catch (_) {}
}

export function useEngagement(slug: string) {
  const [liked, setLiked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`shuo_liked_${slug}`) === "true";
  });

  const [stats, setStats] = useState<ArticleEngagement>(() => {
    return globalEngagementCache[slug] || DEFAULT_STATS[slug] || { likes: 120, shares: 35, views: 1500 };
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGlobalEngagement();

    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail[slug]) {
        setStats(detail[slug]);
      }
    };

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.slug === slug) {
        setStats(detail.stats);
        if (detail.liked !== undefined) {
          setLiked(detail.liked);
        }
      }
    };

    window.addEventListener("engagement-sync", handleSync);
    window.addEventListener("engagement-update", handleUpdate);

    return () => {
      window.removeEventListener("engagement-sync", handleSync);
      window.removeEventListener("engagement-update", handleUpdate);
    };
  }, [slug]);

  const toggleLike = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;
    const newLikes = Math.max(0, stats.likes + delta);

    // 1. Optimistic local update
    setLiked(nextLiked);
    const newStats = { ...stats, likes: newLikes };
    setStats(newStats);
    globalEngagementCache[slug] = newStats;

    if (typeof window !== "undefined") {
      localStorage.setItem(`shuo_liked_${slug}`, nextLiked ? "true" : "false");
      window.dispatchEvent(
        new CustomEvent("engagement-update", {
          detail: { slug, stats: newStats, liked: nextLiked },
        })
      );
    }

    // 2. Persist to backend server API
    try {
      const res = await fetch("/api/engagement/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, delta }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.stats) {
          globalEngagementCache[slug] = json.stats;
          setStats(json.stats);
        }
      }
    } catch (_) {}
  }, [liked, slug, stats]);

  const shareLink = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const url = typeof window !== "undefined" ? `${window.location.origin}/post/${slug}` : "";

    // 1. Copy URL to clipboard
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch (_) {}

    setCopied(true);
    setTimeout(() => setCopied(false), 2200);

    // 2. Optimistic share count increment
    const newStats = { ...stats, shares: stats.shares + 1 };
    setStats(newStats);
    globalEngagementCache[slug] = newStats;

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("engagement-update", {
          detail: { slug, stats: newStats },
        })
      );
    }

    // 3. Persist to backend server API
    try {
      const res = await fetch("/api/engagement/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.stats) {
          globalEngagementCache[slug] = json.stats;
          setStats(json.stats);
        }
      }
    } catch (_) {}
  }, [slug, stats]);

  const recordView = useCallback(async () => {
    if (typeof window === "undefined") return;
    const sessionKey = `shuo_viewed_${slug}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "true");

    try {
      const res = await fetch("/api/engagement/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.stats) {
          globalEngagementCache[slug] = json.stats;
          setStats(json.stats);
        }
      }
    } catch (_) {}
  }, [slug]);

  return {
    liked,
    likesCount: stats.likes,
    sharesCount: stats.shares,
    viewsCount: stats.views,
    copied,
    toggleLike,
    shareLink,
    recordView,
  };
}
