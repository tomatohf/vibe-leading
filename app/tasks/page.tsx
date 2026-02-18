export const metadata = {
  title: "任务",
  description: "任务管理",
};

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground">任务</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        任务列表与执行进度将在此展示。
      </p>
    </div>
  );
}
