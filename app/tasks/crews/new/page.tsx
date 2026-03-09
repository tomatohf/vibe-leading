"use client";

import { useEffect, useState, type JSX } from "react";
import { useRouter } from "next/navigation";

type Agent = {
  id: string;
  role: string;
};

type TaskForm = {
  key: string;
  description: string;
  expectedOutput: string;
  agentId: string;
  asyncExecution: boolean;
};

function createEmptyTask(): TaskForm {
  return {
    key: crypto.randomUUID(),
    description: "",
    expectedOutput: "",
    agentId: "",
    asyncExecution: false,
  };
}

type FormSubmitEvent = Parameters<
  NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>
>[0];

export default function NewCrewPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("");
  const [taskForms, setTaskForms] = useState<TaskForm[]>([createEmptyTask()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/org/agents")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setAgents(json.data ?? []);
      })
      .catch(() => {});
  }, []);

  function updateTask<K extends keyof TaskForm>(
    key: string,
    field: K,
    value: TaskForm[K]
  ) {
    setTaskForms((prev) =>
      prev.map((t) => (t.key === key ? { ...t, [field]: value } : t))
    );
  }

  function addTask() {
    setTaskForms((prev) => [...prev, createEmptyTask()]);
  }

  function removeTask(key: string) {
    setTaskForms((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((t) => t.key !== key);
    });
  }

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        managerId: managerId || null,
        tasks: taskForms.map((t) => ({
          description: t.description.trim(),
          expectedOutput: t.expectedOutput.trim(),
          agentId: t.agentId || null,
          asyncExecution: t.asyncExecution,
        })),
      };

      const res = await fetch("/api/tasks/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "创建失败");
      }

      router.push("/tasks");
    } catch (e) {
      const message = e instanceof Error ? e.message : "创建失败";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            新建团队任务
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            创建一个团队任务，并添加子任务。
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          返回
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 rounded px-2 py-1">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crew info */}
        <section className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-foreground">基本信息</h2>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              团队任务名称
            </label>
            <input
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
              placeholder="如：市场调研任务、客户分析流程"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
              管理者 Agent（可选，设置后采用分层协作模式）
            </label>
            <select
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
            >
              <option value="">无（顺序执行模式）</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.role}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Tasks */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              子任务列表（{taskForms.length}）
            </h2>
            <button
              type="button"
              onClick={addTask}
              className="rounded-md border border-zinc-200 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              + 添加子任务
            </button>
          </div>

          {taskForms.map((task, idx) => (
            <div
              key={task.key}
              className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  子任务 {idx + 1}
                </span>
                {taskForms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(task.key)}
                    className="rounded-md border border-red-200 px-2 py-0.5 text-[11px] text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    移除
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  描述
                </label>
                <textarea
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
                  rows={2}
                  placeholder="详细描述这个子任务的内容"
                  value={task.description}
                  onChange={(e) =>
                    updateTask(task.key, "description", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  期望输出
                </label>
                <textarea
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
                  rows={2}
                  placeholder="期望该子任务完成后输出的结果"
                  value={task.expectedOutput}
                  onChange={(e) =>
                    updateTask(task.key, "expectedOutput", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  执行 Agent（可选）
                </label>
                <select
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm shadow-sm outline-none ring-0 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500"
                  value={task.agentId}
                  onChange={(e) =>
                    updateTask(task.key, "agentId", e.target.value)
                  }
                >
                  <option value="">未指定</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.role}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300 dark:border-zinc-600"
                  checked={task.asyncExecution}
                  onChange={(e) =>
                    updateTask(task.key, "asyncExecution", e.target.checked)
                  }
                />
                异步执行
              </label>
            </div>
          ))}
        </section>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {saving ? "创建中..." : "创建团队任务"}
          </button>
        </div>
      </form>
    </div>
  );
}
