"use client";

import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  PlusCircle,
  ExternalLink,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Settings as SettingsIcon,
  Globe,
} from "lucide-react";
import { isAuthenticated, logout } from "../../services/auth-store";
import { StudioI18nProvider, useStudioI18n } from "../../services/studio-i18n";
import { ContinuousTabs } from "../../components/ui/continuous-tabs";
import { ThemeToggle } from "../../components/theme-toggle";
import { cn } from "../../components/ui/utils";

function AdminLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useStudioI18n();

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const currentNavId = location.pathname.startsWith("/admin/edit")
    ? "/admin"
    : location.pathname === "/admin/"
    ? "/admin"
    : location.pathname;

  const navTabs = [
    { id: "/admin", label: t("allEssays"), icon: BookOpen },
    { id: "/admin/new", label: t("newEssay"), icon: PlusCircle },
    { id: "/admin/settings", label: t("settings"), icon: SettingsIcon },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl xl:max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">
          {/* Brand & CMS Badge */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="flex items-center gap-2 tracking-tight transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-serif font-bold text-sm shadow-xs">
                EM
              </div>
              <span
                className="font-semibold text-base sm:text-lg"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {t("studio")}
              </span>
            </Link>
            <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
              {t("authorCms")}
            </span>
          </div>

          {/* Navigation Links using ContinuousTabs */}
          <nav className="hidden sm:block">
            <ContinuousTabs
              layoutId="admin-top-nav"
              size="sm"
              tabs={navTabs}
              activeId={currentNavId}
              onChange={(id) => navigate(id)}
            />
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Studio UI Language Switcher using ContinuousTabs */}
            <ContinuousTabs
              layoutId="admin-top-lang"
              size="sm"
              tabs={[
                { id: "en", label: "EN" },
                { id: "zh", label: "中文" },
              ]}
              activeId={lang}
              onChange={(id) => setLang(id as "en" | "zh")}
            />

            {/* View Live Blog Link */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-neutral-300 hover:text-foreground dark:hover:border-neutral-700"
            >
              <span>{t("viewPublic")}</span>
              <ExternalLink className="size-3.5" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              title={t("signOut")}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-900/50 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="mx-auto w-full max-w-6xl xl:max-w-7xl px-6 sm:px-10 lg:px-16 py-10">
        <Outlet />
      </main>
    </div>
  );
}


export function AdminLayout() {
  return (
    <StudioI18nProvider>
      <AdminLayoutInner />
    </StudioI18nProvider>
  );
}

export default AdminLayout;

