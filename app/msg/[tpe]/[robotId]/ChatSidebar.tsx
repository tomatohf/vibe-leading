"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ChatSidebarProps {
  tpe: string;
  robotId: string;
}

interface ChatMessage {
  content: string;
}

interface ChatItem {
  id: string;
  messages: ChatMessage[];
  updatedAt: Date;
}

function getChatTitle(chat: ChatItem): string {
  const first = chat.messages[0];
  if (first?.content) return first.content;
  const date =
    chat.updatedAt instanceof Date ? chat.updatedAt : new Date(chat.updatedAt);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}`;
}

function TpeIcon({ tpe }: { tpe: string }) {
  if (tpe === "crew") {
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
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
      <rect width="20" height="18" x="2" y="2" rx="3" />
      <path d="M12 2V0.5" />
      <circle cx="12" cy="0" r="0.8" fill="currentColor" />
      <circle cx="8" cy="10" r="2" />
      <circle cx="16" cy="10" r="2" />
      <path d="M8 15.5c2 .8 6 .8 8 0" />
    </svg>
  );
}

export function ChatSidebar({ tpe, robotId }: ChatSidebarProps) {
  const pathname = usePathname();
  const baseHref = `/msg/${tpe}/${robotId}`;
  const isNewChat = pathname === baseHref;
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ tpe, robotId });
    fetch(`/api/msg/chats?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok && Array.isArray(json.data)) {
          setChats(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, [tpe, robotId]);

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
          {loading ? (
            <p className="px-2 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
              加载中…
            </p>
          ) : chats.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
              暂无历史会话
            </p>
          ) : (
            <ul className="flex min-w-0 flex-col gap-0.5">
              {chats.map((chat) => {
                const href = `/msg/${tpe}/${robotId}/${chat.id}`;
                const chatTitle = getChatTitle(chat);
                const isActive = pathname === href;
                return (
                  <li key={chat.id} className="min-w-0">
                    <Link
                      href={href}
                      className={`flex items-center gap-2 overflow-hidden rounded-lg px-3 py-2 text-sm text-ellipsis whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                          : "text-zinc-700 hover:bg-zinc-200/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                      title={chatTitle}
                    >
                      <span className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400">
                        <TpeIcon tpe={tpe} />
                      </span>
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {chatTitle}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
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
