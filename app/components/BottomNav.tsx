"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV_ITEMS, getActiveNavKey } from "@/app/config/nav";

const icons: Record<string, React.ReactNode> = {
  message: (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  task: (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  org: (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  me: (
    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

export function BottomNav() {
  const pathname = usePathname();
  const activeKey = getActiveNavKey(pathname);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/95"
      role="navigation"
      aria-label="主导航"
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 text-xs transition-colors ${
                isActive
                  ? "text-foreground font-medium"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {icons[item.icon] ?? null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
