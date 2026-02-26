import React from "react";
import Link from "next/link";

interface Params {
  tpe: string;
  agentId: string;
}

export default function NewChatPage({ params }: { params: Promise<Params> }) {
  const { tpe, agentId } = React.use(params);

  return (
    <Link href={`/msg/${tpe}/${agentId}/chatId`}>新会话</Link>
  );
}
