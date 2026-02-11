import { memo } from "react";
import { NodeProps } from "@xyflow/react";
import { SystemGroup } from "@/data/demoData";

export interface GroupNodeData {
  label: string;
  group: SystemGroup;
  width: number;
  height: number;
  color: string;
}

const GROUP_COLOR_VARS: Record<string, string> = {
  // PostHog groups
  "web-app": "--node-api",
  "frontend": "--node-component",
  "plugin-server": "--node-utility",
  "workers": "--node-config",
  "temporal": "--node-problem",
  "rust-services": "--node-rust",
  "infrastructure": "--node-data",
  "livestream": "--node-external",
  // Daytona groups
  "d-api": "--node-api",
  "d-dashboard": "--node-component",
  "d-runner": "--node-utility",
  "d-daemon": "--node-config",
  "d-cli": "--node-problem",
  "d-gateway": "--node-rust",
  "d-sdks": "--node-external",
  "d-infra": "--node-data",
  // ksync groups
  "k-cli": "--node-problem",
  "k-core": "--node-utility",
  "k-syncthing": "--node-component",
  "k-radar": "--node-config",
  "k-proto": "--node-api",
  "k-infra": "--node-data",
};

function getGroupColorVar(group: string): string {
  return GROUP_COLOR_VARS[group] || "--node-config";
}

function GroupNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as GroupNodeData;
  const colorVar = getGroupColorVar(nodeData.group);

  return (
    <div
      className="rounded-2xl pointer-events-none"
      style={{
        width: nodeData.width,
        height: nodeData.height,
        backgroundColor: `hsl(var(${colorVar}) / 0.08)`,
        border: `1.5px dashed hsl(var(${colorVar}) / 0.25)`,
      }}
    >
      <div
        className="absolute -top-1 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md"
        style={{
          color: `hsl(var(${colorVar}) / 0.7)`,
          backgroundColor: "hsl(var(--background))",
        }}
      >
        {nodeData.label}
      </div>
    </div>
  );
}

export const GroupNode = memo(GroupNodeComponent);
