import { ChatSidebar } from "./ChatSidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ tpe: string; agentId: string }>;
}

export default async function MsgAgentLayout({ children, params }: LayoutProps) {
  const { tpe, agentId } = await params;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <ChatSidebar tpe={tpe} agentId={agentId} />
      <div className="flex flex-1 min-w-0 flex-col bg-background">
        {children}
      </div>
    </div>
  );
}
