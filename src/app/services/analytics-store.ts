"use client";

import { useState, useEffect } from "react";

export interface ArticleStat {
  slug: string;
  title: string;
  views: number;
  readers: number;
  likes: number;
  avgReadTime: string;
  completionRate: number;
  shares: number;
}

export interface DailyTraffic {
  date: string;
  day: string;
  views: number;
  readers: number;
  likes: number;
}

export const DAILY_TRAFFIC_DATA: DailyTraffic[] = [
  { date: "Aug 13", day: "Wed", views: 2410, readers: 1820, likes: 142 },
  { date: "Aug 14", day: "Thu", views: 2890, readers: 2150, likes: 189 },
  { date: "Aug 15", day: "Fri", views: 3200, readers: 2400, likes: 210 },
  { date: "Aug 16", day: "Sat", views: 2750, readers: 1980, likes: 165 },
  { date: "Aug 17", day: "Sun", views: 3100, readers: 2280, likes: 194 },
  { date: "Aug 18", day: "Mon", views: 3840, readers: 2920, likes: 258 },
  { date: "Aug 19", day: "Tue", views: 4200, readers: 3180, likes: 312 },
  { date: "Aug 20", day: "Wed", views: 3950, readers: 2980, likes: 274 },
  { date: "Aug 21", day: "Thu", views: 4420, readers: 3340, likes: 328 },
  { date: "Aug 22", day: "Fri", views: 4890, readers: 3680, likes: 385 },
  { date: "Aug 23", day: "Sat", views: 4120, readers: 3050, likes: 296 },
  { date: "Aug 24", day: "Sun", views: 4350, readers: 3280, likes: 310 },
  { date: "Aug 25", day: "Mon", views: 5120, readers: 3920, likes: 412 },
  { date: "Aug 26", day: "Today", views: 5480, readers: 4180, likes: 448 },
];

export const INITIAL_ARTICLE_STATS: Record<string, { views: number; readers: number; likes: number; avgReadTime: string; completionRate: number; shares: number }> = {
  "on-writing-less": {
    views: 18450,
    readers: 12840,
    likes: 1240,
    avgReadTime: "3m 48s",
    completionRate: 84,
    shares: 412,
  },
  "small-tools-big-leverage": {
    views: 14200,
    readers: 9850,
    likes: 890,
    avgReadTime: "4m 12s",
    completionRate: 79,
    shares: 285,
  },
  "the-quiet-hours": {
    views: 9480,
    readers: 6820,
    likes: 480,
    avgReadTime: "3m 15s",
    completionRate: 88,
    shares: 196,
  },
  "notes-on-typography": {
    views: 6160,
    readers: 4670,
    likes: 235,
    avgReadTime: "5m 02s",
    completionRate: 72,
    shares: 114,
  },
};

export function getArticleStats(slug: string) {
  return INITIAL_ARTICLE_STATS[slug] || {
    views: Math.floor(Math.random() * 2000) + 500,
    readers: Math.floor(Math.random() * 1500) + 300,
    likes: Math.floor(Math.random() * 120) + 20,
    avgReadTime: "3m 30s",
    completionRate: 76,
    shares: Math.floor(Math.random() * 50) + 10,
  };
}
