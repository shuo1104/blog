"use client";

import React, { useMemo } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "./utils";

export interface ParsedMarkdown {
  title: string;
  excerpt: string;
  readingTime: string;
  sections: { id: string; title: string; paragraphs: string[] }[];
  rawMarkdown: string;
}

// Helper to slugify heading text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

// Parse markdown text into structured title, sections, and reading time
export function parseMarkdown(mdText: string, lang: "en" | "zh" = "en"): ParsedMarkdown {
  if (!mdText) {
    return {
      title: lang === "zh" ? "未命名文章" : "Untitled Essay",
      excerpt: "",
      readingTime: lang === "zh" ? "1 分钟阅读" : "1 min read",
      sections: [],
      rawMarkdown: "",
    };
  }

  // Extract H1 title
  const h1Match = mdText.match(/^#\s+(.+)$/m);
  const title = h1Match ? h1Match[1].trim() : (lang === "zh" ? "未命名文章" : "Untitled Essay");

  // Remove H1 title from text body
  const bodyText = mdText.replace(/^#\s+.+$/m, "").trim();

  // Split by H2 headers (## Heading)
  const h2Regex = /^##\s+(.+)$/gm;
  const sections: { id: string; title: string; paragraphs: string[] }[] = [];
  
  // Find all H2 positions
  const matches: { title: string; index: number; length: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = h2Regex.exec(bodyText)) !== null) {
    matches.push({ title: m[1].trim(), index: m.index, length: m[0].length });
  }

  if (matches.length === 0) {
    // Single section without H2 headers
    const paragraphs = bodyText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    sections.push({
      id: "overview",
      title: lang === "zh" ? "正文导言" : "Overview",
      paragraphs: paragraphs.length > 0 ? paragraphs : [bodyText],
    });
  } else {
    // Intro content before the first H2
    if (matches[0].index > 0) {
      const introText = bodyText.substring(0, matches[0].index).trim();
      if (introText) {
        const paragraphs = introText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
        sections.push({
          id: "overview",
          title: lang === "zh" ? "正文导言" : "Overview",
          paragraphs,
        });
      }
    }

    // For each H2 section
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i + 1 < matches.length ? matches[i + 1].index : bodyText.length;
      const content = bodyText.substring(current.index + current.length, nextIndex).trim();
      const paragraphs = content
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      sections.push({
        id: slugify(current.title) || `section-${i + 1}`,
        title: current.title,
        paragraphs: paragraphs.length > 0 ? paragraphs : [content],
      });
    }
  }

  // Calculate excerpt from first text paragraph
  let excerpt = "";
  for (const s of sections) {
    for (const p of s.paragraphs) {
      if (p && !p.startsWith("![") && !p.startsWith("```") && !p.startsWith("#")) {
        excerpt = p.slice(0, 160) + (p.length > 160 ? "..." : "");
        break;
      }
    }
    if (excerpt) break;
  }

  // Calculate reading time
  const totalWords = mdText.trim().split(/\s+/).length;
  const totalChars = mdText.replace(/\s/g, "").length;
  const minutes = lang === "zh" ? Math.max(1, Math.ceil(totalChars / 350)) : Math.max(1, Math.ceil(totalWords / 200));
  const readingTime = lang === "zh" ? `${minutes} 分钟阅读` : `${minutes} min read`;

  return {
    title,
    excerpt,
    readingTime,
    sections,
    rawMarkdown: mdText,
  };
}

// Convert Structured Post Sections back into standard Markdown string
export function sectionsToMarkdown(title: string, sections: { id: string; title: string; paragraphs: string[] }[]): string {
  let out = `# ${title || "Untitled Essay"}\n\n`;
  if (!sections || sections.length === 0) return out.trim();
  for (const sec of sections) {
    if (sec.title && sec.title !== "Overview" && sec.title !== "正文导言") {
      out += `## ${sec.title}\n\n`;
    }
    for (const para of sec.paragraphs) {
      out += `${para}\n\n`;
    }
  }
  return out.trim();
}

// Code Block with Copy Button
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 font-mono text-xs text-neutral-200 shadow-md">
      <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-2 bg-neutral-900/60">
        <span className="text-[11px] text-neutral-400 font-sans font-medium uppercase tracking-wider">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Parse inline formatting: **bold**, *italic*, `code`, [links](url), ![images](url)
function renderInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\!\[[^\]]*\]\([^\)]+\)|\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|~~[^~]+~~)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];

    // Image: ![alt](url)
    if (token.startsWith("![")) {
      const altMatch = token.match(/\!\[([^\]]*)\]\(([^\)]+)\)/);
      if (altMatch) {
        parts.push(
          <span key={match.index} className="my-6 block overflow-hidden rounded-2xl border border-border/70 shadow-xs bg-neutral-100 dark:bg-neutral-850">
            <img src={altMatch[2]} alt={altMatch[1] || "Image"} className="w-full object-cover max-h-[550px]" />
            {altMatch[1] && (
              <span className="block py-2 text-center text-xs text-muted-foreground bg-neutral-50 dark:bg-neutral-900/80 border-t border-border/40 font-mono">
                {altMatch[1]}
              </span>
            )}
          </span>
        );
      }
    }
    // Link: [text](url)
    else if (token.startsWith("[")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^\)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-foreground font-medium underline underline-offset-4 hover:opacity-80 transition-opacity inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="size-3 inline opacity-60" />
          </a>
        );
      }
    }
    // Bold: **text**
    else if (token.startsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // Italic: *text*
    else if (token.startsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-foreground/90 font-serif">
          {token.slice(1, -1)}
        </em>
      );
    }
    // Inline code: `code`
    else if (token.startsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 font-mono text-[0.88em] font-medium text-foreground border border-border/50"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    // Strikethrough: ~~text~~
    else if (token.startsWith("~~")) {
      parts.push(
        <s key={match.index} className="line-through text-muted-foreground">
          {token.slice(2, -2)}
        </s>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length === 0 ? text : parts;
}

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = useMemo(() => {
    if (!content) return [];
    const rawLines = content.split("\n");
    const result: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = "";
    let codeBuffer: string[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Code Block Start / End
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          result.push(
            <CodeBlock
              key={`code-${i}`}
              code={codeBuffer.join("\n")}
              language={codeLanguage}
            />
          );
          codeBuffer = [];
          inCodeBlock = false;
          codeLanguage = "";
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, "");
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      const trimmed = line.trim();

      // Empty line
      if (trimmed === "") {
        continue;
      }

      // H1 (# Title)
      if (trimmed.startsWith("# ")) {
        const titleText = trimmed.replace(/^#\s+/, "");
        result.push(
          <h1
            key={`h1-${i}`}
            id={slugify(titleText)}
            className="mb-8 mt-12 scroll-mt-24 text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground first:mt-0"
            style={{ fontFamily: "Fraunces, serif", lineHeight: 1.15 }}
          >
            {renderInlineFormatting(titleText)}
          </h1>
        );
        continue;
      }

      // H2 (## Heading)
      if (trimmed.startsWith("## ")) {
        const h2Text = trimmed.replace(/^##\s+/, "");
        result.push(
          <h2
            key={`h2-${i}`}
            id={slugify(h2Text)}
            className="mb-6 mt-12 scroll-mt-24 text-2xl sm:text-3xl font-medium tracking-tight text-foreground"
            style={{ fontFamily: "Fraunces, serif", lineHeight: 1.25 }}
          >
            {renderInlineFormatting(h2Text)}
          </h2>
        );
        continue;
      }

      // H3 (### Heading)
      if (trimmed.startsWith("### ")) {
        const h3Text = trimmed.replace(/^###\s+/, "");
        result.push(
          <h3
            key={`h3-${i}`}
            id={slugify(h3Text)}
            className="mb-4 mt-8 scroll-mt-24 text-xl sm:text-2xl font-medium tracking-tight text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {renderInlineFormatting(h3Text)}
          </h3>
        );
        continue;
      }

      // Blockquote (> Quote)
      if (trimmed.startsWith("> ")) {
        const quoteText = trimmed.replace(/^>\s+/, "");
        result.push(
          <blockquote
            key={`quote-${i}`}
            className="my-6 rounded-r-2xl border-l-3 border-foreground/80 bg-neutral-100/50 dark:bg-neutral-850/40 px-5 py-3.5 text-base sm:text-lg italic text-foreground/90 font-serif leading-relaxed"
          >
            {renderInlineFormatting(quoteText)}
          </blockquote>
        );
        continue;
      }

      // Horizontal Rule (---)
      if (trimmed === "---" || trimmed === "***") {
        result.push(
          <hr key={`hr-${i}`} className="my-10 border-t border-border/60" />
        );
        continue;
      }

      // Standalone Image Line: ![alt](url)
      if (trimmed.startsWith("![") && trimmed.endsWith(")")) {
        const altMatch = trimmed.match(/\!\[([^\]]*)\]\(([^\)]+)\)/);
        if (altMatch) {
          result.push(
            <div key={`img-${i}`} className="my-8 overflow-hidden rounded-2xl border border-border/70 shadow-xs bg-neutral-100 dark:bg-neutral-850">
              <img src={altMatch[2]} alt={altMatch[1] || "Image"} className="w-full object-cover max-h-[550px]" />
              {altMatch[1] && (
                <div className="py-2 text-center text-xs text-muted-foreground bg-neutral-50 dark:bg-neutral-900/80 border-t border-border/40 font-mono">
                  {altMatch[1]}
                </div>
              )}
            </div>
          );
          continue;
        }
      }

      // Bullet List (- Item)
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.replace(/^[-*]\s+/, "");
        result.push(
          <li
            key={`li-${i}`}
            className="ml-6 list-disc text-base sm:text-lg text-foreground/90 leading-relaxed my-1.5"
          >
            {renderInlineFormatting(itemText)}
          </li>
        );
        continue;
      }

      // Numbered List (1. Item)
      if (/^\d+\.\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^\d+\.\s+/, "");
        result.push(
          <li
            key={`oli-${i}`}
            className="ml-6 list-decimal text-base sm:text-lg text-foreground/90 leading-relaxed my-1.5"
          >
            {renderInlineFormatting(itemText)}
          </li>
        );
        continue;
      }

      // Standard Paragraph
      result.push(
        <p
          key={`p-${i}`}
          className="text-base sm:text-lg text-foreground/90 leading-relaxed font-normal my-5"
          style={{ lineHeight: 1.85 }}
        >
          {renderInlineFormatting(line)}
        </p>
      );
    }

    if (inCodeBlock && codeBuffer.length > 0) {
      result.push(
        <CodeBlock
          key="code-end"
          code={codeBuffer.join("\n")}
          language={codeLanguage}
        />
      );
    }

    return result;
  }, [content]);

  return (
    <div className={cn("w-full text-foreground space-y-1", className)}>
      {blocks}
    </div>
  );
}

export default MarkdownRenderer;
