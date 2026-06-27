import { type Metadata } from "next";
import WorkspaceContent from "@/app/portal/agent/workspace/WorkspaceContent";


export const metadata: Metadata = {
  title: "Campaign Workspace | DealFlow.AI",
  description: "Interactive campaign and marketing outreach workspace for DealFlow AI revenue agents.",
};

export default function WorkspacePage() {
  return <WorkspaceContent />;
}

// Force IDE re-index for WorkspaceContent module import

