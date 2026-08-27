import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { DiscreteTabs, type TabItem } from "./ui/discrete-tabs";
import { ThemeToggle } from "./theme-toggle";
import { NowPlayingBar } from "./now-playing-bar";
import { BookOpen, User } from "lucide-react";
import { cn } from "./ui/utils";

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isPostPage = pathname.startsWith("/post");
  const currentRouteTab = pathname.startsWith("/about") ? "about" : "writing";

  const navTabs: TabItem[] = [
    {
      id: "writing",
      icon: <BookOpen size={15} />,
      label: "Writing",
      activeColor: "text-neutral-900 dark:text-white",
      onClick: () => navigate("/"),
    },
    {
      id: "about",
      icon: <User size={15} />,
      label: "About",
      activeColor: "text-neutral-900 dark:text-white",
      onClick: () => navigate("/about"),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl xl:max-w-7xl flex-col px-6 sm:px-10 lg:px-16 pb-20">
        {!isPostPage && (
          <header className="flex items-center justify-between py-8 mb-8">
            <Link
              to="/"
              className="tracking-tight hover:opacity-80 transition-opacity"
              style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: "1.35rem" }}
            >
              Shuo
            </Link>

            <div className="flex items-center gap-2">
              {/* Independent Expandable Navigation Tabs (Writing & About) */}
              <DiscreteTabs
                tabs={navTabs}
                activeTab={currentRouteTab}
                onTabChange={(id) => navigate(id === "about" ? "/about" : "/")}
                size="sm"
              />

              {/* Standalone Tactile 3D Follow-Button Theme Toggle */}
              <ThemeToggle />
            </div>
          </header>
        )}

        <main className={cn("flex-1", isPostPage ? "pt-10 sm:pt-14" : "")}>
          <Outlet />
        </main>


        <footer className="py-8 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>© {new Date().getFullYear()} Shuo</span>
          </div>
        </footer>


      </div>

      {/* Floating Now Playing Bar in bottom-right corner */}
      <aside
        aria-label="Now playing audio player"
        className="fixed bottom-5 right-5 z-50 pointer-events-auto"
      >
        <NowPlayingBar />
      </aside>
    </div>
  );
}


