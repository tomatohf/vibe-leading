'use client'

import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useAgent, AgentSubscriberParams, Message } from "@copilotkit/react-core/v2";

interface Params {
  tpe: string;
  robotId: string;
  chatId: string;
}

type Robot = { name: string };

function NewChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default function ChatPage({ params }: { params: Promise<Params> }) {
  const { tpe, robotId, chatId } = React.use(params);
  const [robot, setRobot] = useState<Robot | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/org/agents/${robotId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.ok && json?.data) {
          setRobot({
            name: json.data.role,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [robotId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-background px-4 py-3 dark:border-zinc-800">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href={`/msg/${tpe}/${robotId}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            title="新会话"
            aria-label="新会话"
          >
            <NewChatIcon />
          </Link>
        </div>
        <h1 className="min-w-0 flex-1 truncate text-center text-sm font-medium text-foreground">
          {robot?.name}
        </h1>
        <div className="flex min-w-0 flex-1" aria-hidden />
      </header>
      <CopilotKit
        runtimeUrl={`/api/copilotkit/${tpe}/${robotId}`}
        enableInspector={false}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <Chat tpe={tpe} robotId={robotId} robot={robot} />
        </div>
      </CopilotKit>
    </div>
  );
}

function Chat({ tpe, robotId, robot }: { tpe: string; robotId: string; robot: Robot | null }) {
  const { agent } = useAgent();

  function onNewMessage(params: { message: Message } & AgentSubscriberParams) {
    const threadId = agent.threadId;
    const messages = params.messages;
  }

  React.useEffect(() => {
    const { unsubscribe } = agent.subscribe({
      onNewMessage,
    });
    return unsubscribe;
  });

  return (
    <CopilotChat
      className="flex flex-1 min-h-0 flex-col h-full [&_.copilotKitMessages]:flex-1 [&_.copilotKitMessages]:min-h-0 [&_.copilotKitMessages]:overflow-auto"
      labels={{
        title: robot?.name ?? `${tpe} ${robotId}`,
        placeholder: robot ? `给 ${robot.name} 发送消息` : `给 ${tpe} 发送消息`,
      }}
    />
  );
}
