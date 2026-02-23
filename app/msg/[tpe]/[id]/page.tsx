import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core"; 
import { CopilotChat } from "@copilotkit/react-ui";
import React from 'react';


interface Params {
  // 动态路由参数都是字符串类型
  tpe: string;
  id: string;
}

export default function Chat({ params }: { params: Promise<Params> }) {
  const { tpe, id } = React.use(params);

  return (
    <CopilotKit
      runtimeUrl={`/api/copilotkit/${tpe}/${id}`}
      enableInspector={false}
    >
      <CopilotChat
        instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
        labels={{
          title: "Your Assistant",
          initial: "Hi! 👋 How can I assist you today?",
        }}
      />
    </CopilotKit>
  );
}
