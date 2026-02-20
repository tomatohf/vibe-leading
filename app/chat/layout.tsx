import "@copilotkit/react-ui/styles.css";
import { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core"; 

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    // enableInspector={false}
    <CopilotKit runtimeUrl="/api/copilotkit">
      {children}
    </CopilotKit>
  );
}
