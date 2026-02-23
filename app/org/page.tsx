"use client";

import { useEffect, useState, type JSX } from "react";


type Agent = {
  id: string;
  role: string;
  goal: string;
  backstory: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  role: string;
  goal: string;
  backstory: string;
};

const emptyForm: FormState = {
  role: "",
  goal: "",
  backstory: "",
};

type FormSubmitEvent = Parameters<
  NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>
>[0];

export default function OrgPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function fetchAgents() {
    try {
      setLoading(true);
      const res = await fetch("/api/org/agents");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "加载失败");
      }
      setAgents(json.data ?? []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "加载 Agent 列表失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAgents();
  }, []);

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEdit(agent: Agent) {
    setEditingId(agent.id);
    setForm({
      role: agent.role,
      goal: agent.goal,
      backstory: agent.backstory,
    });
    setError(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        role: form.role.trim(),
        goal: form.goal.trim(),
        backstory: form.backstory.trim(),
      };

      const isEdit = Boolean(editingId);

      const res = await fetch(
        isEdit ? `/api/org/agents/${editingId}` : "/api/org/agents",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "保存失败");
      }

      await fetchAgents();
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "保存失败";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  async function handleDelete(id: string) {
    if (!confirm("确定要删除该 Agent 吗？")) return;
    setError(null);
    try {
      const res = await fetch(`/api/org/agents/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json && json.ok === false)) {
        throw new Error(json.error || "删除失败");
      }
      await fetchAgents();
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "删除失败";
      setError(message);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">组织</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          在这里维护用于 AI 对话的 Agent 智能体。
        </p>
      </div>

      <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-foreground">
          {editingId ? "编辑 Agent" : "新建 Agent"}
        </h2>
        {error && (
          <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded px-2 py-1">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              角色（role）
            </label>
            <input
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
              placeholder="如：销售顾问、项目经理助手"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              目标（goal）
            </label>
            <textarea
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
              rows={2}
              placeholder="该 Agent 主要帮助用户完成什么事情？"
              value={form.goal}
              onChange={(e) => handleChange("goal", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              背景（backstory）
            </label>
            <textarea
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
              rows={3}
              placeholder="为 Agent 补充一些人设、背景和说话风格……"
              value={form.backstory}
              onChange={(e) => handleChange("backstory", e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                取消编辑
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {saving ? "保存中..." : editingId ? "保存修改" : "创建 Agent"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Agent 列表</h2>
          {loading && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              加载中...
            </span>
          )}
        </div>
        {agents.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            还没有配置任何 Agent，先在上方创建一个吧。
          </p>
        ) : (
          <ul className="space-y-2">
            {agents.map((agent) => (
              <li
                key={agent.id}
                className="space-y-1 rounded-lg border border-zinc-200 bg-white p-3 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {agent.role}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-zinc-600 dark:text-zinc-300">
                      {agent.goal}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(agent)}
                      className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(agent.id)}
                      className="rounded-md border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-zinc-500 dark:text-zinc-400">
                  {agent.backstory}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
