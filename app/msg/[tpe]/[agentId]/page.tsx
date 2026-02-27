import Link from "next/link";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Params {
  tpe: string;
  agentId: string;
}

export default async function NewChatPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { tpe, agentId } = await params;

  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, agentId),
  });

  if (!agent) {
    notFound();
  }

  return (
    <Link href={`/msg/${tpe}/${agentId}/chatId`}>
      新会话{agent.role ? ` · ${agent.role}` : ""}
    </Link>
  );
}
