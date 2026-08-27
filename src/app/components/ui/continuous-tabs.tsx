"use client";

import React, { useState, useEffect, type FC, type ReactNode } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "./utils";

/* ---------- Types ---------- */
export interface TabItem {
  id: string;
  label: string | ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ContinuousTabsProps {
  tabs: TabItem[];
  activeId?: string;
  defaultActiveId?: string;
  onChange?: (id: string) => void;
  layoutId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ContinuousTabs: FC<ContinuousTabsProps> = ({
  tabs,
  activeId: controlledActiveId,
  defaultActiveId,
  onChange,
  layoutId = "continuous-tab-pill",
  size = "md",
  className,
}) => {
  const [internalActive, setInternalActive] = useState<string>(
    controlledActiveId ?? defaultActiveId ?? tabs[0]?.id ?? ""
  );
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const active = controlledActiveId !== undefined ? controlledActiveId : internalActive;

  const handleChange = (id: string) => {
    if (controlledActiveId === undefined) {
      setInternalActive(id);
    }
    onChange?.(id);
  };

  if (!isMounted) {
    return (
      <nav
        className={cn(
          "relative flex items-center rounded-full border border-[#E5E5E9] dark:border-zinc-800 bg-linear-to-b from-[#ffffff] to-[#e9e9f2] dark:from-zinc-900 dark:to-zinc-950 p-1",
          className
        )}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold",
              active === tab.id
                ? "text-[#EDEDEC] dark:text-zinc-950 bg-[#252528] dark:bg-zinc-100 rounded-full"
                : "text-[#343437] dark:text-zinc-500"
            )}
          >
            {tab.label}
          </div>
        ))}
      </nav>
    );
  }

  const sizeClasses = {
    sm: {
      nav: "gap-0.5 p-1",
      button: "px-2.5 py-1 text-xs",
      text: "text-xs font-medium",
    },
    md: {
      nav: "gap-0.5 sm:gap-1 p-1 sm:p-1.5",
      button: "px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm",
      text: "text-xs sm:text-sm font-semibold",
    },
    lg: {
      nav: "gap-1 p-1.5 sm:p-2",
      button: "px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base",
      text: "text-sm sm:text-base font-semibold",
    },
  }[size];

  return (
    <LayoutGroup id={layoutId}>
      <nav
        className={cn(
          "relative flex items-center rounded-full border border-[#E5E5E9] dark:border-zinc-800",
          "bg-linear-to-b from-[#ffffff] to-[#e9e9f2] dark:from-zinc-900 dark:to-zinc-950",
          "shadow-[inset_0_-2px_4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.03)]",
          "dark:shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.4)]",
          "transition-all duration-300 w-fit",
          sizeClasses.nav,
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleChange(tab.id)}
              className={cn(
                "relative rounded-full outline-none select-none transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.97]",
                sizeClasses.button
              )}
            >
              {/* Active pill */}
              {isActive && (
                <motion.div
                  layoutId={`${layoutId}-pill`}
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 32,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 rounded-full bg-[#252528] dark:bg-zinc-100 shadow-xs"
                />
              )}


              {/* Icon if provided */}
              {Icon && (
                <span
                  className={cn(
                    "relative z-10 transition-colors duration-200",
                    isActive
                      ? "text-[#EDEDEC] dark:text-zinc-950"
                      : "text-[#343437] dark:text-zinc-500 hover:text-[#62625D] dark:hover:text-zinc-300"
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
              )}

              {/* Text */}
              <motion.span
                layout="position"
                className={cn(
                  "relative z-10 transition-colors duration-200 whitespace-nowrap flex items-center gap-1",
                  sizeClasses.text,
                  isActive
                    ? "text-[#EDEDEC] dark:text-zinc-950"
                    : "text-[#343437] dark:text-zinc-500 hover:text-[#62625D] dark:hover:text-zinc-300"
                )}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </nav>
    </LayoutGroup>
  );
};

export default ContinuousTabs;
