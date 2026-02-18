export const metadata = {
  title: "消息",
  description: "消息与对话",
};

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground">消息</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        消息列表与对话入口将在此展示。
      </p>
      <ul className="mt-4 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-300">
        <li><a href="/chat" className="underline">AI 对话</a>（CopilotKit）</li>
      </ul>
    </div>
  );
}
