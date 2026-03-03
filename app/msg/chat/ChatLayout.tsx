"use client";

import { ChatSidebar } from "./ChatSidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: { tpe: string; robotId: string };
}

export default function ChatLayout({ children, params }: LayoutProps) {
  const { tpe, robotId } = params;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <ChatSidebar tpe={tpe} robotId={robotId} />
      <div className="mx-auto flex min-h-0 min-w-0 max-w-4xl flex-1 flex-col bg-background">
        {children}
      </div>
    </div>
  );
}
