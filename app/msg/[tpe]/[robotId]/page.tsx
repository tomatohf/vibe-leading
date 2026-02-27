"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Params {
  tpe: string;
  robotId: string;
}

type Agent = { role: string; goal: string; backstory: string };

export default function NewChatPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tpe, robotId } = React.use(params);
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/org/agents/${robotId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.ok && json?.data) {
          setAgent({
            role: json.data.role,
            goal: json.data.goal,
            backstory: json.data.backstory,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [robotId]);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const chatId = crypto.randomUUID();
    router.push(`/msg/${tpe}/${robotId}/${chatId}`);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        加载中…
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
        未找到该 Agent
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl px-4 py-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-base font-semibold text-foreground">
            {agent.role}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {agent.goal}
          </p>
          <p className="mt-3 line-clamp-4 text-xs text-zinc-500 dark:text-zinc-400">
            {agent.backstory}
          </p>
        </div>
        <p className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          在下方输入消息开始与 {agent.role} 对话
        </p>
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`给 ${agent.role} 发送消息…`}
              rows={3}
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as { preventDefault(): void });
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 self-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
