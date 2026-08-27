"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  ArrowLeft,
  Save,
  Globe,
  Sparkles,
  Check,
  Eye,
  Edit3,
  Columns,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Quote,
  Code as CodeIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Calendar,
  Clock,
  Tag as TagIcon,
  X,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { usePostsStore, type Post } from "../../services/posts-store";
import { useStudioI18n } from "../../services/studio-i18n";
import { ContinuousTabs } from "../../components/ui/continuous-tabs";
import {
  MarkdownRenderer,
  parseMarkdown,
  sectionsToMarkdown,
} from "../../components/ui/markdown-renderer";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../components/ui/utils";


export function PostEditor({ mode = "edit" }: { mode?: "create" | "edit" }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { getPost, savePost } = usePostsStore();
  const { lang: studioLang, t } = useStudioI18n();

  const [activeLang, setActiveLang] = useState<"en" | "zh">("en");
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Metadata state
  const [postSlug, setPostSlug] = useState("");
  const [postDate, setPostDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState<string[]>(["Writing", "Craft"]);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState("");



  // Markdown Content states
  const [enMarkdown, setEnMarkdown] = useState<string>(
    mode === "create"
      ? `# New Essay Title\n\nStart writing your thoughts here...\n\n## First Section\n\nAdd paragraphs, reflections, or insights.`
      : `# On Writing Less\n\nI used to measure a good writing day by word count...\n\n## The Word Count Trap\n\nIn software, we celebrate deleting lines of code...`
  );

  const [zhMarkdown, setZhMarkdown] = useState<string>(
    mode === "create"
      ? `# 新文章标题\n\n在此开始书写您的思考与观点...\n\n## 第一章节\n\n记录正文、洞见与思考。`
      : `# 论简短写作\n\n我曾经习惯用字数来衡量一天的写作成果...\n\n## 字数的陷阱\n\n在软件开发中，我们为删减代码行数而欢呼...`
  );

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const markdownImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const hasLoadedSlugRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Load existing post ONCE when editing a slug
  useEffect(() => {
    if (mode === "edit" && slug && hasLoadedSlugRef.current !== slug) {
      const existing = getPost(slug);
      if (existing) {
        hasLoadedSlugRef.current = slug;
        setPostSlug(existing.slug);
        setPostDate(existing.date);
        setTags(existing.tags || []);
        setCoverImage(existing.coverImage || "");

        // Convert structured sections to clean Markdown
        const enText =
          sectionsToMarkdown(
            existing.en?.title || existing.title || "Untitled",
            existing.en?.sections || []
          ) || existing.en?.title || "";
        setEnMarkdown(enText);

        const zhText =
          sectionsToMarkdown(
            existing.zh?.title || "无标题",
            existing.zh?.sections || []
          ) || existing.zh?.title || "";
        setZhMarkdown(zhText);
      }
    }
  }, [mode, slug]);

  const currentMarkdown = activeLang === "en" ? enMarkdown : zhMarkdown;
  const setCurrentMarkdown = activeLang === "en" ? setEnMarkdown : setZhMarkdown;

  // Parsed markdown stats in real-time
  const parsedCurrent = React.useMemo(() => {
    return parseMarkdown(currentMarkdown, activeLang);
  }, [currentMarkdown, activeLang]);

  // Auto-generate slug from English title
  const handleAutoSlug = () => {
    const parsedEn = parseMarkdown(enMarkdown, "en");
    const titleToUse = parsedEn.title;
    if (!titleToUse) return;
    const generated = titleToUse
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
    setPostSlug(generated);
  };

  // Tag Management
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Markdown Toolbar Insert Helper
  const insertMarkdown = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = currentMarkdown.substring(start, end) || defaultText;

    const replacement = before + selected + after;
    const nextMarkdown =
      currentMarkdown.substring(0, start) + replacement + currentMarkdown.substring(end);

    setCurrentMarkdown(nextMarkdown);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 10);
  };

  // Helper to compress large image files into lightweight optimized JPEG data URLs
  const compressAndReadImage = (file: File, maxWidth = 1600, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === "image/svg+xml" || file.type === "image/gif") {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Cover Image File Upload Handler
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const compressed = await compressAndReadImage(file, 1600, 0.85);
      setCoverImage(compressed);
      showToast(studioLang === "zh" ? "✓ 封面头图上传成功并已自动优化" : "✓ Cover image uploaded & optimized");
    } catch (err) {
      console.error("Failed to upload cover image:", err);
      showToast(studioLang === "zh" ? "⚠️ 封面图处理失败，请重试" : "⚠️ Failed to process cover image");
    } finally {
      setIsProcessingImage(false);
      e.target.value = "";
    }
  };

  // Cover Image Drag & Drop Handlers
  const handleCoverDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setIsProcessingImage(true);
      try {
        const compressed = await compressAndReadImage(file, 1600, 0.85);
        setCoverImage(compressed);
        showToast(studioLang === "zh" ? "✓ 封面头图上传成功" : "✓ Cover image uploaded");
      } catch (err) {
        console.error("Failed to drop cover image:", err);
        showToast(studioLang === "zh" ? "⚠️ 封面图处理失败" : "⚠️ Failed to process cover image");
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  // Markdown Inline Image Upload Handler
  const handleMarkdownImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const compressed = await compressAndReadImage(file, 1200, 0.82);
      insertMarkdown(`\n\n![${cleanName}](${compressed})\n\n`, "", "");
      showToast(studioLang === "zh" ? "✓ 正文插图已成功插入 Markdown" : "✓ Image inserted into Markdown");
    } catch (err) {
      console.error("Failed to upload markdown image:", err);
      showToast(studioLang === "zh" ? "⚠️ 图片插入失败" : "⚠️ Failed to insert image");
    } finally {
      setIsProcessingImage(false);
      e.target.value = "";
    }
  };

  // Textarea Paste Handler (Supports pasting screenshots from clipboard)
  const handleTextareaPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setIsProcessingImage(true);
          try {
            const compressed = await compressAndReadImage(file, 1200, 0.82);
            insertMarkdown(`\n\n![Pasted Image](${compressed})\n\n`, "", "");
            showToast(studioLang === "zh" ? "✓ 已从剪贴板粘贴并插入图片" : "✓ Pasted image inserted into Markdown");
          } catch (err) {
            console.error("Failed to paste image:", err);
            showToast(studioLang === "zh" ? "⚠️ 剪贴板图片解析失败" : "⚠️ Failed to parse pasted image");
          } finally {
            setIsProcessingImage(false);
          }
        }
        return;
      }
    }
  };

  // Textarea Drop Handler (Supports dragging and dropping images directly into editor)
  const handleTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      setIsProcessingImage(true);
      try {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        const compressed = await compressAndReadImage(file, 1200, 0.82);
        insertMarkdown(`\n\n![${cleanName}](${compressed})\n\n`, "", "");
        showToast(studioLang === "zh" ? "✓ 图片已拖拽插入 Markdown" : "✓ Dropped image inserted into Markdown");
      } catch (err) {
        console.error("Failed to drop image into markdown:", err);
        showToast(studioLang === "zh" ? "⚠️ 拖拽图片插入失败" : "⚠️ Failed to drop image");
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  // Save / Publish post

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!postSlug.trim()) {
      alert("Please enter a URL slug (e.g. on-writing-less)");
      return;
    }

    const enParsed = parseMarkdown(enMarkdown, "en");
    const zhParsed = parseMarkdown(zhMarkdown, "zh");

    const postPayload: Post = {
      slug: postSlug.trim(),
      date: postDate,
      tags: tags.length > 0 ? tags : ["Essay"],
      coverImage: coverImage.trim() || undefined,
      title: enParsed.title || zhParsed.title,
      readingTime: enParsed.readingTime,
      excerpt: enParsed.excerpt || zhParsed.excerpt,
      sections: enParsed.sections,
      content: enParsed.sections.flatMap((s) => s.paragraphs),
      en: {
        title: enParsed.title,
        readingTime: enParsed.readingTime,
        excerpt: enParsed.excerpt,
        coverImage: coverImage.trim() || undefined,
        sections: enParsed.sections,
        content: enParsed.sections.flatMap((s) => s.paragraphs),
      },
      zh: {
        title: zhParsed.title,
        readingTime: zhParsed.readingTime,
        excerpt: zhParsed.excerpt,
        coverImage: coverImage.trim() || undefined,
        sections: zhParsed.sections,
        content: zhParsed.sections.flatMap((s) => s.paragraphs),
      },
    };


    savePost(postPayload);
    setSavedSuccess(true);

    setTimeout(() => {
      setSavedSuccess(false);
      navigate("/admin");
    }, 800);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 pb-28">

      {/* Sticky Top Control Bar */}
      <div className="sticky top-16 z-40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 bg-background/90 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="group flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-neutral-300 hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <div>
            <h1
              className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {mode === "create" ? t("writeNewEssayTitle") : `${t("editEssayTitle")} /post/${slug}`}
            </h1>
          </div>
        </div>

        {/* Action Tools & Save Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Bilingual Language Switcher with ContinuousTabs */}
          <ContinuousTabs
            layoutId="editor-content-lang"
            size="sm"
            tabs={[
              { id: "en", label: "🇬🇧 English" },
              { id: "zh", label: "🇨🇳 中文" },
            ]}
            activeId={activeLang}
            onChange={(id) => setActiveLang(id as "en" | "zh")}
          />

          {/* View Mode Switcher with ContinuousTabs */}
          <ContinuousTabs
            layoutId="editor-view-modes"
            size="sm"
            tabs={[
              { id: "edit", label: t("writeMode"), icon: Edit3 },
              { id: "split", label: t("splitMode"), icon: Columns },
              { id: "preview", label: t("previewMode"), icon: Eye },
            ]}
            activeId={viewMode}
            onChange={(id) => setViewMode(id as "edit" | "split" | "preview")}
          />

          {/* Publish / Save Button */}

          <button
            type="submit"
            className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {savedSuccess ? (
              <>
                <Check className="size-4 text-emerald-400" />
                <span>{t("publishedBtn")}</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>{t("publishBtn")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden File Input for Cover Image Upload */}
      <input
        type="file"
        ref={coverFileInputRef}
        accept="image/*"
        onChange={handleCoverFileUpload}
        className="hidden"
      />

      {/* Hidden File Input for Markdown Inline Image Upload */}
      <input
        type="file"
        ref={markdownImageFileInputRef}
        accept="image/*"
        onChange={handleMarkdownImageUpload}
        className="hidden"
      />

      {/* Publication Metadata Card */}
      <div className="rounded-3xl border border-border/60 bg-white/90 p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90 flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            {t("pubMetadata")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Post Slug */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">
                  {t("urlSlug")}
                </label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="cursor-pointer text-[10px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  {t("autoFromTitle")}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground/60">
                  /post/
                </span>
                <input
                  type="text"
                  value={postSlug}
                  onChange={(e) => setPostSlug(e.target.value)}
                  placeholder="on-writing-less"
                  required
                  className="w-full rounded-xl border border-border/70 bg-neutral-50/50 py-2 pl-16 pr-3 font-mono text-xs text-foreground outline-none focus:border-neutral-900 focus:bg-white dark:bg-neutral-850/50 dark:focus:border-neutral-400 dark:focus:bg-neutral-900"
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                {t("publishDate")}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border/70 bg-neutral-50/50 py-2 pl-9 pr-3 text-xs text-foreground outline-none focus:border-neutral-900 focus:bg-white dark:bg-neutral-850/50 dark:focus:border-neutral-400 dark:focus:bg-neutral-900"
                />
              </div>
            </div>

            {/* Reading Time (Auto calculated) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">
                {t("readingTime")} ({activeLang.toUpperCase()})
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  readOnly
                  value={parsedCurrent.readingTime}
                  className="w-full rounded-xl border border-border/70 bg-neutral-100/60 py-2 pl-9 pr-3 text-xs text-foreground/80 outline-none cursor-default font-mono dark:bg-neutral-850/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image Upload & Hero Media Box */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <ImageIcon className="size-3.5 text-muted-foreground" />
              <span>{t("coverImageLabel")}</span>
            </label>
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="cursor-pointer text-[11px] text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                <span>{t("removeImageBtn")}</span>
              </button>
            )}
          </div>

          {coverImage ? (
            <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-4 items-center rounded-2xl border border-border/70 bg-neutral-50/50 dark:bg-neutral-850/40 p-3.5">
              {/* 16:9 Thumbnail preview */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/80 group/img bg-neutral-200 dark:bg-neutral-800">
                <img
                  src={coverImage}
                  alt="Cover Preview"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="cursor-pointer rounded-lg bg-white/90 text-neutral-900 px-2.5 py-1 text-xs font-semibold shadow-xs flex items-center gap-1 hover:bg-white"
                  >
                    <RefreshCw className="size-3" />
                    <span>{t("replaceImageBtn")}</span>
                  </button>
                </div>
              </div>

              {/* URL Edit / Upload Actions */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Upload className="size-3.5" />
                    <span>{t("replaceImageBtn")}</span>
                  </button>
                  <span className="text-xs text-muted-foreground font-mono">
                    {coverImage.startsWith("data:") ? "✓ Local Image Uploaded" : "✓ Remote URL Configured"}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-border/70 bg-white/80 py-1.5 pl-3 pr-3 text-xs font-mono text-foreground outline-none focus:border-neutral-900 dark:bg-neutral-900 dark:focus:border-neutral-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingCover(true);
              }}
              onDragLeave={() => setIsDraggingCover(false)}
              onDrop={handleCoverDrop}
              className={cn(
                "rounded-2xl border-2 border-dashed p-6 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center",
                isDraggingCover
                  ? "border-neutral-900 bg-neutral-100/80 dark:border-neutral-100 dark:bg-neutral-800"
                  : "border-border/80 bg-neutral-50/50 hover:border-neutral-400 dark:bg-neutral-850/30 dark:hover:border-neutral-700"
              )}
            >
              <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-3 text-muted-foreground">
                <Upload className="size-5" />
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-foreground">
                  {t("dragDropImage")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  JPG, PNG, WebP or GIF up to 8MB
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                >
                  <Upload className="size-3.5" />
                  <span>{t("uploadImageBtn")}</span>
                </button>
              </div>

              {/* Or Paste URL */}
              <div className="w-full max-w-md pt-2 border-t border-border/40 mt-1">
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder={t("pasteUrlPlaceholder")}
                  className="w-full rounded-xl border border-border/70 bg-white/80 py-1.5 px-3 text-xs text-foreground outline-none text-center focus:text-left focus:border-neutral-900 dark:bg-neutral-900 dark:focus:border-neutral-400"
                />
              </div>
            </div>
          )}
        </div>



        {/* Tags Manager */}
        <div className="mt-5 flex flex-col gap-2">
          <label className="text-xs font-medium text-foreground">
            {t("tagsLabel")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-neutral-100/80 px-3 py-1 text-xs font-medium text-foreground dark:bg-neutral-850"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="cursor-pointer text-muted-foreground hover:text-red-500"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={t("addTagPlaceholder")}
                className="rounded-full border border-dashed border-border/80 bg-transparent px-3 py-1 text-xs text-foreground outline-none focus:border-solid focus:border-neutral-900 dark:focus:border-neutral-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="cursor-pointer rounded-full bg-neutral-200 px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Main Standard Markdown Studio */}

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        {/* Markdown Toolbar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-neutral-50/80 px-4 py-2.5 dark:bg-neutral-850/80 flex-wrap gap-2">
          {/* Quick Syntax Tools */}
          <div className="flex items-center gap-1 flex-wrap text-muted-foreground">
            <button
              type="button"
              onClick={() => insertMarkdown("# ", "", "Main Title")}
              title="Heading 1 (# )"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Heading1 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("## ", "", "Section Heading")}
              title="Heading 2 (## )"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Heading2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("### ", "", "Subheading")}
              title="Heading 3 (### )"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Heading3 className="size-4" />
            </button>

            <span className="h-4 w-px bg-border/80 mx-1" />

            <button
              type="button"
              onClick={() => insertMarkdown("**", "**", "bold text")}
              title="Bold (**text**)"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Bold className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("*", "*", "italic text")}
              title="Italic (*text*)"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Italic className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("~~", "~~", "strikethrough text")}
              title="Strikethrough (~~text~~)"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Strikethrough className="size-4" />
            </button>

            <span className="h-4 w-px bg-border/80 mx-1" />

            <button
              type="button"
              onClick={() => insertMarkdown("> ", "", "Reflective quote here...")}
              title="Blockquote (> )"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Quote className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("```typescript\n", "\n```", "// write code here")}
              title="Code Block (```)"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <CodeIcon className="size-4" />
            </button>

            <span className="h-4 w-px bg-border/80 mx-1" />

            <button
              type="button"
              onClick={() => insertMarkdown("- ", "", "List item")}
              title="Bullet List (- )"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("1. ", "", "Ordered item")}
              title="Numbered List (1. )"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <ListOrdered className="size-4" />
            </button>

            <span className="h-4 w-px bg-border/80 mx-1" />

            <button
              type="button"
              onClick={() => insertMarkdown("[", "](https://example.com)", "link text")}
              title="Link ([text](url))"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <LinkIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => markdownImageFileInputRef.current?.click()}
              title="Upload Local Image or Insert Image (![alt](url))"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <ImageIcon className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => insertMarkdown("\n---\n\n", "")}
              title="Horizontal Rule (---)"
              className="cursor-pointer rounded-md p-1.5 hover:bg-neutral-200 hover:text-foreground dark:hover:bg-neutral-800 active:scale-95 transition-all duration-75"
            >
              <Minus className="size-4" />
            </button>
          </div>


          {/* Active Info Badge */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span>{parsedCurrent.sections.length} {t("sectionsDetected")}</span>
            <span>·</span>
            <span>{currentMarkdown.length} {t("chars")}</span>
          </div>
        </div>

        {/* Editor & Preview Area */}
        <div className="min-h-[550px]">
          {/* 1. Only Write Mode */}
          {viewMode === "edit" && (
            <textarea
              ref={textareaRef}
              value={currentMarkdown}
              onChange={(e) => setCurrentMarkdown(e.target.value)}
              onPaste={handleTextareaPaste}
              onDrop={handleTextareaDrop}
              placeholder="# Start writing standard Markdown here..."
              className="w-full min-h-[550px] p-6 font-mono text-sm leading-relaxed text-foreground bg-transparent outline-none resize-y selection:bg-neutral-300 dark:selection:bg-neutral-700"
              style={{ tabSize: 2, lineHeight: 1.75 }}
            />
          )}

          {/* 2. Only Preview Mode */}
          {viewMode === "preview" && (
            <div className="p-8 sm:p-12 max-w-3xl mx-auto min-h-[550px]">
              <MarkdownRenderer content={currentMarkdown} />
            </div>
          )}

          {/* 3. Split Screen Mode (Side-by-Side) */}
          {viewMode === "split" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/60 min-h-[550px]">
              {/* Left Raw Markdown Editor */}
              <div className="p-4 flex flex-col">
                <div className="text-[11px] font-mono font-semibold text-muted-foreground uppercase mb-2 px-2">
                  {t("markdownSource")}
                </div>
                <textarea
                  ref={textareaRef}
                  value={currentMarkdown}
                  onChange={(e) => setCurrentMarkdown(e.target.value)}
                  onPaste={handleTextareaPaste}
                  onDrop={handleTextareaDrop}
                  placeholder="# Start writing standard Markdown here..."
                  className="w-full flex-1 min-h-[500px] p-4 font-mono text-xs sm:text-sm leading-relaxed text-foreground bg-transparent outline-none resize-y selection:bg-neutral-300 dark:selection:bg-neutral-700"
                  style={{ tabSize: 2, lineHeight: 1.75 }}
                />
              </div>

              {/* Right Rendered Live Preview */}
              <div className="p-6 sm:p-8 overflow-y-auto max-h-[700px] bg-neutral-50/40 dark:bg-neutral-950/40">
                <div className="text-[11px] font-mono font-semibold text-muted-foreground uppercase mb-4">
                  {t("livePreview")}
                </div>
                <MarkdownRenderer content={currentMarkdown} />
              </div>
            </div>
          )}
        </div>

        {/* Editor Bottom Helper Bar */}
        <div className="border-t border-border/50 bg-neutral-50/60 px-5 py-3 text-xs text-muted-foreground dark:bg-neutral-850/50 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>
              {studioLang === "zh"
                ? "提示：输入 ## 章节标题可自动生成前台左侧粘性小地图导航"
                : "Tip: Use ## Chapter Title to automatically generate the front-end minimap navigation"}
            </span>
          </span>
          <span className="font-mono text-[11px]">Markdown Standard</span>
        </div>
      </div>

      {/* Floating Status / Success Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-2.5 text-xs font-medium text-emerald-200 shadow-2xl backdrop-blur-md dark:border-emerald-500/40 dark:bg-emerald-900/90"
          >
            <Check className="size-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Image Processing Spinner */}
      <AnimatePresence>
        {isProcessingImage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full border border-border/80 bg-neutral-900/90 px-5 py-2.5 text-xs font-medium text-white shadow-2xl backdrop-blur-md dark:bg-white/90 dark:text-neutral-900"
          >
            <Loader2 className="size-4 animate-spin text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{studioLang === "zh" ? "正在压缩优化图片并上传..." : "Optimizing & uploading image..."}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export default PostEditor;

