"use client";

import { useState, useEffect, type FC, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TabItem {
  id: string;
  icon: ReactNode;
  label: string;
  activeColor?: string;
  onClick?: () => void;
}

export interface DiscreteTabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  defaultTab?: string;
  className?: string;
  size?: "default" | "sm";
}

export const DiscreteTabs: FC<DiscreteTabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  defaultTab,
  className = "",
  size = "sm",
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    controlledActiveTab || defaultTab || tabs[0]?.id,
  );

  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const [shine, setShine] = useState<boolean>(false);

  const handleTabClick = (tab: TabItem) => {
    setInternalActiveTab(tab.id);
    tab.onClick?.();
    if (onTabChange) onTabChange(tab.id);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShine(true), 500);
    return () => {
      clearTimeout(timer);
      setShine(false);
    };
  }, [activeTab]);

  return (
    <div
      className={`flex items-center gap-1.5 sm:gap-2 select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab)}
            className="relative focus:outline-none cursor-pointer"
          >
            <motion.div
              layout="position"
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
                mass: 1,
              }}
              className={`relative flex h-8.5 sm:h-9 items-center justify-center rounded-full border transition-colors duration-200 ${
                isActive
                  ? "w-auto px-2.5 sm:px-3 border-neutral-200/90 bg-neutral-100/90 text-neutral-900 shadow-sm dark:border-neutral-700/80 dark:bg-neutral-800/90 dark:text-white"
                  : "w-8.5 sm:w-9 p-0 border-transparent bg-transparent text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-white"
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-1.5 cursor-pointer">
                <motion.div
                  animate={{ scale: isActive ? 1.05 : 1 }}
                  className={`flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center shrink-0 [&>svg]:size-full ${
                    tab.activeColor && isActive ? tab.activeColor : ""
                  }`}
                >
                  {tab.icon}
                </motion.div>
                <motion.span
                  animate={{
                    width: isActive ? "auto" : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  className={`relative overflow-hidden whitespace-nowrap text-xs font-medium ${
                    tab.activeColor && isActive ? tab.activeColor : ""
                  }`}
                >
                  {tab.label}
                  <AnimatePresence>
                    {isActive && shine && (
                      <motion.span
                        initial={{ left: "-120%" }}
                        animate={{ left: "120%" }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/50 dark:via-white/30 to-transparent pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </motion.span>
              </div>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
};

export default DiscreteTabs;
