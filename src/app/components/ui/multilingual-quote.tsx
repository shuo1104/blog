"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";

export interface Quote {
  id: string;
  label: string;
  text: string;
}

export interface MultilingualQuoteProps {
  quotes: Quote[];
  defaultLanguage?: string;
  authorName?: string;
  authorLink?: string;
  className?: string;
  quoteClassName?: string;
}

export function MultilingualQuote({
  quotes = [],
  defaultLanguage,
  authorName,
  authorLink,
  className,
  quoteClassName,
}: MultilingualQuoteProps) {
  const [activeQuoteId, setActiveQuoteId] = useState<string>(
    defaultLanguage || (quotes.length > 0 ? quotes[0].id : ""),
  );

  const activeQuote =
    quotes.find((q) => q.id === activeQuoteId) || quotes[0];

  if (!activeQuote) return null;

  return (
    <div
      data-slot="multilingual-quote"
      className={cn(
        "my-8 flex w-full flex-col items-center justify-center rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-6 text-center shadow-xs select-none dark:border-neutral-800/80 dark:bg-neutral-900/50 sm:p-8",
        className,
      )}
    >
      <div className="relative grid w-full max-w-prose place-items-center">
        <AnimatePresence mode="popLayout">
          {activeQuote && (
            <motion.p
              key={activeQuote.id}
              initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, filter: "blur(8px)", y: -6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "text-base leading-relaxed text-foreground/80 italic [grid-area:1/1] sm:text-lg dark:text-neutral-300",
                quoteClassName,
              )}
              style={{ fontFamily: "Fraunces, serif" }}
            >
              “{activeQuote.text}”
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {authorName && (
          authorLink ? (
            <a
              href={authorLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              — {authorName}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-60"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              — {authorName}
            </span>
          )
        )}

        {quotes.length > 1 && (
          <div className="flex items-center gap-1 rounded-full border border-neutral-200/80 bg-white/90 p-0.5 shadow-xs dark:border-neutral-700/80 dark:bg-neutral-800/90">
            {quotes.map((quote) => (
              <button
                key={quote.id}
                type="button"
                onClick={() => setActiveQuoteId(quote.id)}
                className={cn(
                  "cursor-pointer rounded-full px-2.5 py-1 text-[11px] leading-none font-medium tracking-wide transition-all duration-200 select-none",
                  activeQuoteId === quote.id
                    ? "bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white",
                )}
              >
                {quote.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultilingualQuote;
