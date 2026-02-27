'use client'

import React from "react";
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
    <CopilotKit
      runtimeUrl={`/api/copilotkit/${tpe}/${robotId}`}
      enableInspector={false}
    >
      <div className="flex h-full min-h-0 flex-col">
        <Chat tpe={tpe} robotId={robotId} robot={robot} />
      </div>
    </CopilotKit>
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
      labels={{
        title: robot?.name ?? `${tpe} ${robotId}`,
        placeholder: robot ? `给 ${robot.name} 发送消息` : `给 ${tpe} 发送消息`,
      }}
    />
  );
}
