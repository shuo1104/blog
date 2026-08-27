"use client";

import React, { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Heart,
  Eye,
  Globe,
  Clock,
  Shield,
  KeyRound,
  User,
  Check,
  AlertCircle,
  BarChart3,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getStoredCredentials, setCredentials } from "../../services/auth-store";
import { usePostsStore } from "../../services/posts-store";
import { useStudioI18n } from "../../services/studio-i18n";
import { ContinuousTabs } from "../../components/ui/continuous-tabs";
import {
  DAILY_TRAFFIC_DATA,
  getArticleStats,
} from "../../services/analytics-store";
import { cn } from "../../components/ui/utils";


export function AdminSettings() {
  const { lang, setLang, t } = useStudioI18n();
  const [activeTab, setActiveTab] = useState<"analytics" | "security">("analytics");

  // Account security state
  const currentCreds = getStoredCredentials();
  const [username, setUsername] = useState(currentCreds.username);
  const [password, setPassword] = useState(currentCreds.password);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState("");

  // Posts for analytics
  const { posts } = usePostsStore();
  const [hoveredDay, setHoveredDay] = useState<number | null>(DAILY_TRAFFIC_DATA.length - 1);
  const [timeRange, setTimeRange] = useState<"14d" | "7d">("14d");

  const trafficData = useMemo(() => {
    return timeRange === "7d" ? DAILY_TRAFFIC_DATA.slice(-7) : DAILY_TRAFFIC_DATA;
  }, [timeRange]);

  const maxViews = useMemo(() => {
    return Math.max(...trafficData.map((d) => d.views));
  }, [trafficData]);

  const handleSecuritySubmit = (e: React.FormEvent) => {

    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setSecurityError(t("credsError"));
      return;
    }
    setCredentials(username, password);
    setSecuritySuccess(true);
    setSecurityError("");
    setTimeout(() => setSecuritySuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1
            className="text-3xl font-medium tracking-tight text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {t("settingsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("settingsSubtitle")}
          </p>
        </div>

        {/* Tab Toggle Pill with ContinuousTabs */}
        <ContinuousTabs
          layoutId="settings-main-tabs"
          size="sm"
          tabs={[
            { id: "analytics", label: t("tabAnalytics"), icon: BarChart3 },
            { id: "security", label: t("tabSecurity"), icon: Shield },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as "analytics" | "security")}
        />
      </div>

      {/* TAB 1: Analytics & Traffic Dashboard */}
      {activeTab === "analytics" && (
        <div className="flex flex-col gap-8">
          {/* Interactive Traffic Visual Timeline Chart */}
          <div className="rounded-3xl border border-border/60 bg-white/90 p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("velocityTitle")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("velocitySubtitle")}
                </p>
              </div>

              {/* Range Switcher with ContinuousTabs */}
              <ContinuousTabs
                layoutId="settings-traffic-range"
                size="sm"
                tabs={[
                  { id: "14d", label: t("last14d") },
                  { id: "7d", label: t("last7d") },
                ]}
                activeId={timeRange}
                onChange={(id) => setTimeRange(id as "14d" | "7d")}
              />
            </div>


            {/* Interactive Bar Chart */}
            <div className="flex items-end gap-2 sm:gap-3 h-52 sm:h-60 pt-6 border-b border-border/50">
              {trafficData.map((item, idx) => {
                const heightPct = Math.max(12, Math.round((item.views / maxViews) * 100));
                const isHovered = hoveredDay === idx;

                return (
                  <div
                    key={item.date}
                    onMouseEnter={() => setHoveredDay(idx)}
                    className="group relative flex-1 h-full flex flex-col justify-end items-center cursor-pointer"
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 whitespace-nowrap rounded-xl bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-xl dark:bg-white dark:text-neutral-900 pointer-events-none transition-all">
                        <div className="font-bold font-mono">{item.views.toLocaleString()} {t("pageViewsUnit")}</div>
                        <div className="text-[10px] opacity-80">
                          {item.readers} {t("readersUnit")} · {item.likes} {t("likesUnit")}
                        </div>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={cn(
                        "w-full rounded-t-xl transition-all duration-300",
                        isHovered
                          ? "bg-neutral-900 dark:bg-white shadow-md"
                          : "bg-neutral-200/80 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700"
                      )}
                    />

                    {/* Date label */}
                    <span
                      className={cn(
                        "mt-2.5 text-[10px] font-mono whitespace-nowrap transition-colors",
                        isHovered
                          ? "font-bold text-foreground"
                          : "text-muted-foreground/70"
                      )}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Date Breakdown Footnote */}
            {hoveredDay !== null && trafficData[hoveredDay] && (
              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-muted-foreground font-mono pt-2">
                <span className="font-semibold text-foreground">
                  {trafficData[hoveredDay].date} {t("daySummary")}
                </span>
                <div className="flex items-center gap-4">
                  <span>👀 {trafficData[hoveredDay].views.toLocaleString()} {t("pageViewsUnit")}</span>
                  <span>👥 {trafficData[hoveredDay].readers.toLocaleString()} {t("readersUnit")}</span>
                  <span>❤️ {trafficData[hoveredDay].likes} {t("likesUnit")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Per-Article Engagement Breakdown Table */}
          <div className="rounded-3xl border border-border/60 bg-white/90 p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                  {t("articleTableTitle")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("articleTableSubtitle")}
                </p>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {posts.length} {t("publishedEssaysCount")}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                    <th className="pb-3 pl-2 font-medium">{t("tableColTitle")}</th>
                    <th className="pb-3 font-medium text-right">{t("tableColViews")}</th>
                    <th className="pb-3 font-medium text-right">{t("tableColReaders")}</th>
                    <th className="pb-3 font-medium text-right">{t("tableColLikes")}</th>
                    <th className="pb-3 font-medium text-right">{t("tableColTime")}</th>
                    <th className="pb-3 font-medium text-right pr-2">{t("tableColCompletion")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {posts.map((post) => {
                    const stats = getArticleStats(post.slug);
                    return (
                      <tr
                        key={post.slug}
                        className="group hover:bg-neutral-50/60 dark:hover:bg-neutral-850/40 transition-colors"
                      >
                        {/* Title & Link */}
                        <td className="py-4 pl-2 font-medium text-foreground max-w-xs">
                          <Link
                            to={`/post/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 hover:underline underline-offset-4 tracking-tight"
                            style={{ fontFamily: "Fraunces, serif" }}
                          >
                            <span className="truncate text-sm sm:text-base">
                              {lang === "zh" ? (post.zh?.title || post.title) : (post.en?.title || post.title)}
                            </span>
                            <ArrowUpRight className="size-3 text-muted-foreground shrink-0" />
                          </Link>
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            /post/{post.slug}
                          </div>
                        </td>

                        {/* Views */}
                        <td className="py-4 text-right font-mono font-semibold text-foreground">
                          {stats.views.toLocaleString()}
                        </td>

                        {/* Readers */}
                        <td className="py-4 text-right font-mono text-muted-foreground">
                          {stats.readers.toLocaleString()}
                        </td>

                        {/* Likes */}
                        <td className="py-4 text-right font-mono text-red-600 dark:text-red-400 font-semibold">
                          ❤️ {stats.likes.toLocaleString()}
                        </td>

                        {/* Avg Time */}
                        <td className="py-4 text-right font-mono text-muted-foreground">
                          {stats.avgReadTime}
                        </td>

                        {/* Completion Rate Bar */}
                        <td className="py-4 text-right font-mono pr-2">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                              <div
                                style={{ width: `${stats.completionRate}%` }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {stats.completionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Account Security & Language Settings */}

      {activeTab === "security" && (
        <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
          {/* Studio Interface Language Switcher Card */}
          <div className="rounded-3xl border border-border/60 bg-white/90 p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-4 mb-5">
              <Languages className="size-4 text-blue-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("studioLangLabel")}
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {lang === "zh" ? "当前语言：简体中文" : "Current: English"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {lang === "zh" ? "选择 Studio 后台管理界面的默认显示语言" : "Select the default display language for Studio CMS"}
                </span>
              </div>

              {/* Language Switcher with ContinuousTabs */}
              <ContinuousTabs
                layoutId="settings-card-lang"
                size="sm"
                tabs={[
                  { id: "en", label: "🇬🇧 English" },
                  { id: "zh", label: "🇨🇳 中文" },
                ]}
                activeId={lang}
                onChange={(id) => setLang(id as "en" | "zh")}
              />
            </div>
          </div>


          {/* Account Security Form */}
          <div className="rounded-3xl border border-border/60 bg-white/90 p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-4 mb-6">
              <Shield className="size-4 text-emerald-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                {t("accountSecurityHeading")}
              </h2>
            </div>

            <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-5">
              {securitySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                >
                  <Check className="size-4 shrink-0" />
                  <span>{t("credsSuccess")}</span>
                </motion.div>
              )}

              {securityError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("studioUsername")}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border/70 bg-neutral-50/50 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-neutral-900 focus:bg-white dark:bg-neutral-850/50 dark:focus:border-neutral-400 dark:focus:bg-neutral-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("studioPassword")}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border/70 bg-neutral-50/50 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:border-neutral-900 focus:bg-white dark:bg-neutral-850/50 dark:focus:border-neutral-400 dark:focus:bg-neutral-900 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.99] dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Check className="size-4" />
                <span>{t("saveNewCreds")}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
