'use client'

import React from "react";
import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useAgent, AgentSubscriberParams, Message } from "@copilotkit/react-core/v2";

interface Params {
  // 动态路由参数都是字符串类型
  tpe: string;
  agentId: string;
  chatId: string;
}

export default function ChatPage({ params }: { params: Promise<Params> }) {
  const { tpe, agentId, chatId } = React.use(params);

  return (
    <CopilotKit
      runtimeUrl={`/api/copilotkit/${tpe}/${agentId}`}
      enableInspector={false}
    >
      <div className="flex h-full min-h-0 flex-col">
        <Chat tpe={tpe} id={agentId} />
      </div>
    </CopilotKit>
  );
}

function Chat({ tpe }: { tpe: string; id: string }) {
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
        placeholder: `给 ${tpe} 发送消息`,
      }}
    />
  );
}
