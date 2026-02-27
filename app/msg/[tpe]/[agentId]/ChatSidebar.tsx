"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChatSidebarProps {
  tpe: string;
  agentId: string;
}

export function ChatSidebar({ tpe, agentId }: ChatSidebarProps) {
  const pathname = usePathname();
  const baseHref = `/msg/${tpe}/${agentId}`;
  const isNewChat = pathname === baseHref;

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-col gap-1 p-2">
        <Link
          href={baseHref}
          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isNewChat
              ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-700 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <span className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400">
            <PlusIcon />
          </span>
          新会话
        </Link>
      </div>
      <div className="flex flex-1 flex-col min-h-0 border-t border-zinc-200 dark:border-zinc-800">
        <div className="px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          历史会话
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {/* 暂无会话数据时可在此接入 API 渲染列表 */}
          <p className="px-2 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
            暂无历史会话
          </p>
        </div>
      </div>
    </aside>
  );
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
