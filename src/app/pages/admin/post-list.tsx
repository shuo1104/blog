"use client";

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Code,
  RotateCcw,
  Check,
  Copy,
  BookOpen,
  Sparkles,
  Tag,
  Calendar,
  Layers,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePostsStore, generatePostsTsExport, type Post } from "../../services/posts-store";
import { useStudioI18n } from "../../services/studio-i18n";
import { ContinuousTabs } from "../../components/ui/continuous-tabs";
import { formatDate } from "../../data/posts";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../components/ui/utils";

export function PostList() {
  const navigate = useNavigate();
  const { posts, deletePost, resetDefaults } = usePostsStore();
  const { lang, t } = useStudioI18n();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);

  // All unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const tagTabs = useMemo(() => {
    return [
      { id: "all", label: `${t("all")} (${posts.length})` },
      ...allTags.map((tag) => ({ id: tag, label: tag })),
    ];
  }, [posts.length, allTags, t]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        search.trim() === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.en.title.toLowerCase().includes(search.toLowerCase()) ||
        p.zh.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchTag = !selectedTag || p.tags.includes(selectedTag);

      return matchSearch && matchTag;
    });
  }, [posts, search, selectedTag]);

  const handleCopyExport = () => {
    const code = generatePostsTsExport(posts);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (slug: string) => {
    deletePost(slug);
    setDeleteConfirmSlug(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1
            className="text-3xl font-medium tracking-tight text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {t("archiveTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("archiveSubtitle")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export Code Modal Trigger */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-neutral-100/80 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-neutral-200/80 active:scale-95 dark:bg-neutral-850 dark:hover:bg-neutral-800"
          >
            <Code className="size-3.5 text-muted-foreground" />
            <span>{t("exportCode")}</span>
          </button>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t("resetConfirm"))) {
                resetDefaults();
              }
            }}
            title={t("resetConfirm")}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-neutral-100/80 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground active:scale-95 dark:bg-neutral-850"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden md:inline">{t("resetDefaults")}</span>
          </button>

          {/* Write New Post */}
          <Link
            to="/admin/new"
            className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus className="size-4" />
            <span>{t("writeNew")}</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full border border-border/70 bg-neutral-50/60 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-foreground outline-none transition-all focus:border-neutral-900 focus:bg-white dark:bg-neutral-900/60 dark:focus:border-neutral-400 dark:focus:bg-neutral-900"
          />
        </div>

        {/* Tag Filters with ContinuousTabs */}
        <div className="flex items-center overflow-x-auto pb-1 sm:pb-0">
          <ContinuousTabs
            layoutId="post-list-tags"
            size="sm"
            tabs={tagTabs}
            activeId={selectedTag ?? "all"}
            onChange={(id) => setSelectedTag(id === "all" ? null : id)}
          />
        </div>
      </div>


      {/* Post Items List */}
      <div className="flex flex-col gap-4">
        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 p-14 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <BookOpen className="size-8 opacity-40" />
            <p className="text-sm">{t("noEssaysFound")}</p>
            <Link
              to="/admin/new"
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
            >
              <Plus className="size-3.5" />
              <span>{t("writeNew")}</span>
            </Link>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.slug}
              className="group relative flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-3xl border border-border/60 bg-white/95 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
            >
              {/* Post Info */}
              <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground select-none">
                  <span className="font-mono font-medium text-foreground/90">
                    {formatDate(post.date, lang === "zh" ? "zh" : "en")}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="font-mono">
                    {lang === "zh" ? (post.zh?.readingTime || post.readingTime) : (post.en?.readingTime || post.readingTime)}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="font-mono text-[11px] rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    /post/{post.slug}
                  </span>
                </div>

                {/* Titles */}
                <div>
                  <h2
                    className="text-xl sm:text-2xl font-medium tracking-tight text-foreground group-hover:text-neutral-950 dark:group-hover:text-white transition-colors"
                    style={{ fontFamily: "Fraunces, serif", lineHeight: 1.2 }}
                  >
                    {lang === "zh" ? (post.zh?.title || post.title) : (post.en?.title || post.title)}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
                    {lang === "zh" ? (post.en?.title) : (post.zh?.title)}
                  </p>
                </div>

                {/* Tags & Section count */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full text-[11px] font-normal px-2.5 py-0.5 border border-transparent bg-neutral-100/90 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                  <span className="text-[11px] text-muted-foreground/70 font-mono ml-1 flex items-center gap-1">
                    <Layers className="size-3" />
                    {(lang === "zh" ? post.zh?.sections?.length : post.en?.sections?.length) || post.en?.sections?.length || 0} {t("sections")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 border-t border-border/40 pt-4 md:border-t-0 md:pt-0">
                {/* View Live Link */}
                <Link
                  to={`/post/${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  title={t("viewPublic")}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all hover:border-neutral-400 hover:text-foreground active:scale-95 dark:hover:border-neutral-600"
                >
                  <ExternalLink className="size-4" />
                </Link>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => navigate(`/admin/edit/${post.slug}`)}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <Edit3 className="size-3.5" />
                  <span>{t("edit")}</span>
                </button>

                {/* Delete Button */}
                {deleteConfirmSlug === post.slug ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(post.slug)}
                      className="cursor-pointer rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 active:scale-95"
                    >
                      {t("confirm")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmSlug(null)}
                      className="cursor-pointer rounded-full border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground active:scale-95"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmSlug(post.slug)}
                    title={t("delete")}
                    className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:hover:border-red-900/50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Export Code Modal */}
      <AnimatePresence>
        {exportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-border/80 bg-background shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Code className="size-4 text-emerald-500" />
                  <h3 className="font-semibold text-sm">{t("exportModalTitle")}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setExportOpen(false)}
                  className="cursor-pointer rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  {t("close")}
                </button>
              </div>

              {/* Code Viewer */}
              <div className="flex-1 overflow-auto p-6 font-mono text-xs leading-relaxed bg-neutral-950 text-neutral-200">
                <pre>{generatePostsTsExport(posts)}</pre>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-border/60 px-6 py-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                <span className="text-xs text-muted-foreground">
                  {t("exportModalDesc")}
                </span>
                <button
                  type="button"
                  onClick={handleCopyExport}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>{t("copyCode")}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PostList;
