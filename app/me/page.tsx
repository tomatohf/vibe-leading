export const metadata = {
  title: "我的",
  description: "个人中心",
};

export default function MePage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground">我的</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        个人资料与设置将在此展示。
      </p>
    </div>
  );
}
