"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { type BaseEvent, EventType, type TextMessageContentEvent } from "@ag-ui/client";
import { type ChatMessage } from "@/lib/db/schema";
import { type Robot } from "@/app/msg/chat/[chatId]/page";
import { TpeIcon } from "@/app/msg/chat/ChatSidebar";

type MsgListItem = {
  chat_id: string;
  tpe: string;
  robot_id: string;
  chat_messages: ChatMessage[];
  chat_created_at: string;
  run_id: string;
  run_events: BaseEvent[];
  run_created_at: string;
};

type RobotMap = Record<string, Robot>;

function chatTitle(messages: MsgListItem["chat_messages"]): string {
  const first = messages?.find((m) => m.role === "user" && m.content?.trim());
  return first?.content?.trim().slice(0, 80) || "新对话";
}

function runTitle(events: BaseEvent[]): string {
  const deltas: string[] = [];
  for (const event of events) {
    if (event.type === EventType.TEXT_MESSAGE_CONTENT) {
      const textMessageContentEvent = event as TextMessageContentEvent;
      deltas.push(textMessageContentEvent.delta);
    }
  }
  return deltas.join('');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

export default function MsgPage() {
  const [list, setList] = useState<MsgListItem[]>([]);
  const [robots, setRobots] = useState<RobotMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/msg/list").then((r) => r.json()),
      fetch("/api/org/agents").then((r) => r.json()),
    ])
      .then(([listRes, agentsRes]) => {
        if (cancelled) return;
        if (!listRes?.ok) {
          setError(listRes?.error ?? "加载消息列表失败");
          return;
        }
        const data = listRes.data ?? [];
        setList(Array.isArray(data) ? data : []);

        const agentList = agentsRes?.ok ? agentsRes.data ?? [] : [];
        const map: RobotMap = {};
        for (const a of agentList) {
          if (a?.id) map[a.id] = {
            tpe: "agent",
            id: a.id,
            name: a.role ?? ""
          };
        }
        setRobots(map);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <Loader2 className="size-8 animate-spin" aria-hidden />
        <span>加载中…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground">消息</h1>

      <ul className="mt-6 flex flex-col gap-0 divide-y divide-zinc-200 dark:divide-zinc-800">
        {list.length === 0 ? (
          <li className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            暂无最近会话
          </li>
        ) : (
          list.map((item) =>
            <MsgItem key={item.run_id} item={item} robot={robots[item.robot_id]} />
        ))}
      </ul>
    </div>
  );
}

function MsgItem({item, robot}: {
  item: MsgListItem;
  robot?: Robot;
}) {
  return (
    <li key={item.chat_id}>
      <Link
        href={`/msg/chat/${item.chat_id}`}
        className="flex gap-3 px-2 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 mt-1">
          <TpeIcon tpe={item.tpe} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-medium text-foreground">
              {robot?.name ?? item.robot_id}
            </span>
            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              {formatDate(item.run_created_at)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-zinc-600 dark:text-zinc-400">
            {runTitle(item.run_events)}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{chatTitle(item.chat_messages)}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
