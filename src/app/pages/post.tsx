import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Globe, BookOpen, Calendar, Heart, Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePostsStore } from "../services/posts-store";
import { formatDate } from "../data/posts";
import { Badge } from "../components/ui/badge";
import { ProximitySidebar, type ProximitySection } from "../components/ui/proximity-sidebar";
import { MarkdownRenderer } from "../components/ui/markdown-renderer";
import { ThemeToggle } from "../components/theme-toggle";
import { useEngagement } from "../services/engagement-service";
import { cn } from "../components/ui/utils";

export function Post() {
  const { slug } = useParams();
  const { getPost, posts } = usePostsStore();
  const post = slug ? getPost(slug) : undefined;
  const [lang, setLang] = useState<"en" | "zh">("en");

  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  // Real Persistent Engagement via Backend API
  const { liked, likesCount, sharesCount, copied, toggleLike, shareLink, recordView } = useEngagement(slug || "");

  useEffect(() => {
    recordView();
  }, [recordView]);

  const current = useMemo(() => {
    if (!post) return undefined;
    return lang === "zh" ? (post.zh || post.en) : (post.en || post.zh);
  }, [post, lang]);

  const fallbackImages: Record<string, string> = {
    "on-writing-less": "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
    "small-tools-big-leverage": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80",
    "the-quiet-hours": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1400&q=80",
    "notes-on-taste": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1400&q=80",
  };

  const coverImage = post?.coverImage || current?.coverImage || (slug ? fallbackImages[slug] : undefined);

  const proximitySections: ProximitySection[] = useMemo(() => {
    if (!current?.sections || current.sections.length === 0) {
      return [{ id: "article-content", label: lang === "zh" ? "正文" : "Overview", kind: "title" }];
    }
    return current.sections.map((s, idx) => ({
      id: s.id,
      label: s.title,
      kind: idx === 0 ? "title" : "section",
      level: (idx === 0 ? 1 : 2) as 1 | 2,
    }));
  }, [current, lang]);

  if (!post || !current) {
    return (
      <div className="py-24 text-center">
        <p className="mb-4 text-muted-foreground">That post doesn't exist.</p>
        <Link to="/" className="underline underline-offset-4">
          Back to writing
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto pb-28">
      {/* Top Horizon Navigation Bar */}
      <div className="mb-12 flex items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground active:scale-[0.97] tracking-wide uppercase font-mono"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          <span>{lang === "zh" ? "全部文章" : "All writing"}</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Great UI Style Multilingual Switcher Pill */}
          <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-100/90 p-1 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
            <Globe className="ml-1.5 size-3.5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-all select-none active:scale-[0.96]",
                lang === "en"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("zh")}
              className={cn(
                "cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-all select-none active:scale-[0.96]",
                lang === "zh"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              )}
            >
              中文
            </button>
          </div>

          {/* Standalone Tactile 3D Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-8 lg:gap-14 xl:gap-16 items-start">
        {/* Left Sticky Sidebar: Outline Minimap, Actions & Metadata */}
        <aside className="hidden lg:flex flex-col gap-6 select-none sticky top-20 pt-1">
          {/* Table of Contents Header & Minimap */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                {lang === "zh" ? "章节导航" : "Outline"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {current.sections?.length || 1} SECTIONS
              </span>
            </div>

            <ProximitySidebar
              key={`proximity-${lang}`}
              sections={proximitySections}
              side="left"
            />
          </div>

          {/* Social Engagement Actions in Left Sidebar */}
          <div className="flex flex-col gap-2.5 pt-5">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] font-mono">
              {lang === "zh" ? "互动与分享" : "Engagement"}
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Real Backend Persistent Like Button */}
              <button
                type="button"
                onClick={toggleLike}
                title={liked ? (lang === "zh" ? "已点赞" : "Liked") : (lang === "zh" ? "点赞文章" : "Like post")}
                className={cn(
                  "group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium transition-all active:scale-[0.92] cursor-pointer border",
                  liked
                    ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                    : "border-border/60 bg-neutral-100/80 text-muted-foreground hover:border-red-200 hover:text-red-500 hover:bg-red-50/50 dark:bg-neutral-900/80 dark:hover:bg-neutral-800"
                )}
              >
                <motion.div whileTap={{ scale: 1.25 }}>
                  <Heart className={cn("size-3.5 transition-transform", liked ? "fill-red-500 text-red-500" : "")} />
                </motion.div>
                <span>{likesCount}</span>
              </button>

              {/* Real Backend Persistent Share / Copy Link Button */}
              <button
                type="button"
                onClick={shareLink}
                title={copied ? (lang === "zh" ? "已复制链接" : "Copied link!") : (lang === "zh" ? "复制链接分享" : "Copy link to share")}
                className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium transition-all active:scale-[0.92] cursor-pointer border border-border/60 bg-neutral-100/80 text-muted-foreground hover:text-foreground hover:bg-neutral-200/60 dark:bg-neutral-900/80 dark:hover:bg-neutral-800"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span className="text-emerald-500 text-[10.5px] font-mono">{lang === "zh" ? "已复制" : "Copied"}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-3.5" />
                    <span>{sharesCount}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reading Meta Details in Left Column */}
          <div className="flex flex-col gap-2 pt-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <BookOpen className="size-3.5 text-muted-foreground/80" />
              <span>{current.readingTime}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Calendar className="size-3.5 text-muted-foreground/80" />
              <span>{formatDate(post.date, lang)}</span>
            </div>
          </div>
        </aside>

        {/* Center Main Article Column */}
        <article className="w-full min-w-0 max-w-3xl mx-auto lg:mx-0">
          <header className="mb-8">
            <div className="mb-3 flex items-center gap-2.5 text-xs text-muted-foreground select-none font-mono">
              <time className="font-medium text-foreground/80">{formatDate(post.date, lang)}</time>
              <span aria-hidden className="text-muted-foreground/40">·</span>
              <span>{current.readingTime}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${lang}`}
                initial={{ opacity: 0, y: 3, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -3, filter: "blur(3px)" }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="mb-5 tracking-tight text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-foreground"
                style={{ fontFamily: "Fraunces, serif", lineHeight: 1.15 }}
              >
                {current.title}
              </motion.h1>
            </AnimatePresence>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full font-normal text-xs px-2.5 py-0.5 border border-transparent bg-neutral-100/90 text-neutral-600 dark:bg-neutral-850 dark:text-neutral-300"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </header>

          {/* Hero Cover Image in Widescreen Cinematic Ratio */}
          {coverImage && (
            <motion.div
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-12 w-full aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 shadow-xs bg-neutral-100 dark:bg-neutral-850"
            >
              <img
                src={coverImage}
                alt={current.title}
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}

          {/* Translated Article Markdown Sections */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${lang}`}
              initial={{ opacity: 0, y: 4, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              {current.sections && current.sections.length > 0 ? (
                <div className="flex flex-col gap-10">
                  {current.sections.map((sec, idx) => (
                    <section
                      key={sec.id}
                      id={sec.id}
                      className={cn(
                        "scroll-mt-24",
                        idx > 0 && "pt-10"
                      )}
                    >
                      {sec.title && sec.title !== "Overview" && sec.title !== "正文导言" && (
                        <h2
                          className="mb-5 text-2xl sm:text-[1.65rem] font-medium tracking-tight text-foreground"
                          style={{ fontFamily: "Fraunces, serif", lineHeight: 1.25 }}
                        >
                          {sec.title}
                        </h2>
                      )}
                      <MarkdownRenderer content={sec.paragraphs.join("\n\n")} />
                    </section>
                  ))}
                </div>
              ) : (
                <div id="article-content" className="scroll-mt-24">
                  <MarkdownRenderer content={current.content?.join("\n\n") || ""} />
                </div>
              )}

              {/* Bottom Next/Prev Pagination Cards */}
              <div className="mt-16 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevPost ? (
                  <Link
                    to={`/post/${prevPost.slug}`}
                    className="group flex flex-col gap-1 p-5 rounded-2xl border border-border/80 bg-neutral-50/40 dark:bg-neutral-900/30 hover:border-border hover:bg-neutral-100/50 dark:hover:bg-neutral-850/50 transition-all"
                  >
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      {lang === "zh" ? "← 上一篇" : "← Previous essay"}
                    </span>
                    <span className="font-serif text-base font-medium text-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
                      {(lang === "zh" && prevPost.zh ? prevPost.zh.title : prevPost.en?.title) || prevPost.title}
                    </span>
                  </Link>
                ) : <div />}

                {nextPost && (
                  <Link
                    to={`/post/${nextPost.slug}`}
                    className="group flex flex-col gap-1 p-5 rounded-2xl border border-border/80 bg-neutral-50/40 dark:bg-neutral-900/30 hover:border-border hover:bg-neutral-100/50 dark:hover:bg-neutral-850/50 transition-all text-left sm:text-right"
                  >
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      {lang === "zh" ? "下一篇 →" : "Next essay →"}
                    </span>
                    <span className="font-serif text-base font-medium text-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
                      {(lang === "zh" && nextPost.zh ? nextPost.zh.title : nextPost.en?.title) || nextPost.title}
                    </span>
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </article>
      </div>
    </div>
  );
}

export default Post;
