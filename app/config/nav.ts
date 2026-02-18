/**
 * 整站底部导航配置
 * 四个功能模块：消息、任务、组织、我的
 */
export const BOTTOM_NAV_ITEMS = [
  {
    key: "messages",
    label: "消息",
    href: "/messages",
    icon: "message",
  },
  {
    key: "tasks",
    label: "任务",
    href: "/tasks",
    icon: "task",
  },
  {
    key: "org",
    label: "组织",
    href: "/org",
    icon: "org",
  },
  {
    key: "me",
    label: "我的",
    href: "/me",
    icon: "me",
  },
] as const;

/** 根据 pathname 判断是否属于某模块（用于高亮当前 tab） */
export function getActiveNavKey(pathname: string): string | null {
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/tasks")) return "tasks";
  if (pathname.startsWith("/org")) return "org";
  if (pathname.startsWith("/me")) return "me";
  return null;
}
