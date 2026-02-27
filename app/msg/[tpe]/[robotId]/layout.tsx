import { ChatSidebar } from "./ChatSidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ tpe: string; robotId: string }>;
}

export default async function MsgAgentLayout({ children, params }: LayoutProps) {
  const { tpe, robotId } = await params;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <ChatSidebar tpe={tpe} robotId={robotId} />
      <div className="mx-auto flex min-h-0 min-w-0 max-w-4xl flex-1 flex-col bg-background">
        {children}
      </div>
    </div>
  );
}
