"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Task = {
  id: string;
  crewId: string;
  description: string;
  expectedOutput: string;
  agentId: string | null;
  asyncExecution: boolean | null;
  contexts: string[] | null;
};

type Crew = {
  id: string;
  name: string;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
};

export default function TasksPage() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function fetchCrews() {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks/crews");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "加载失败");
      }
      setCrews(json.data ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "加载团队任务列表失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCrews();
  }, []);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">团队任务</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            管理团队任务及其子任务。
          </p>
        </div>
        <Link
          href="/tasks/crews/new"
          className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          + 新建
        </Link>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded px-2 py-1">
          {error}
        </p>
      )}

      <section className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">任务列表</h2>
          {loading && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              加载中...
            </span>
          )}
        </div>

        {!loading && crews.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            还没有团队任务，点击右上角「+ 新建」创建一个吧。
          </p>
        ) : (
          <ul className="space-y-2">
            {crews.map((crew) => (
              <li
                key={crew.id}
                className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(crew.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {crew.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {crew.tasks.length} 个子任务
                      {crew.managerId ? " · 分层模式" : " · 顺序模式"}
                    </p>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/tasks/crews/${crew.id}/edit`}
                      className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleExpand(crew.id)}
                      className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      {expandedId === crew.id ? "收起" : "展开"}
                    </button>
                  </div>
                </div>

                {expandedId === crew.id && crew.tasks.length > 0 && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800">
                    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {crew.tasks.map((task, idx) => (
                        <li key={task.id} className="px-3 py-2.5 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-zinc-500 dark:text-zinc-400">
                                #{idx + 1}
                              </span>
                              <p className="mt-0.5 text-zinc-700 dark:text-zinc-200 line-clamp-2">
                                {task.description}
                              </p>
                              <p className="mt-1 text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                期望输出：{task.expectedOutput}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                              {task.asyncExecution && (
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                  异步
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
