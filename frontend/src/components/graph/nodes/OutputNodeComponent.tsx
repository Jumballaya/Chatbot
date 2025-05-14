import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { Port } from "../../../graph/types";

export type OutputNodeProps = {
  id: string;
  data: {
    target: { output: Port<"string"> };
  };
};

export default function OutputNodeComponent() {
  return (
    <BaseNodeComponent title="Output">
      <div className="relative px-1 py-0.5 space-y-0.5 h-12 flex items-center">
        <span className="block text-sm text-gray-400 ml-2">Output</span>
        <Handle id="input" type="target" position={Position.Left} />
      </div>
    </BaseNodeComponent>
  );
}
