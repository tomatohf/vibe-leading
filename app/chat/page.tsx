import { CopilotChat } from "@copilotkit/react-ui";

export default function Chat() {
  return (
    // TODO: 使用实际的 agent 相关数据替换以下信息
    <CopilotChat
      instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have."}
      labels={{
        title: "Your Assistant",
        initial: "Hi! 👋 How can I assist you today?",
      }}
    />
  );
}
