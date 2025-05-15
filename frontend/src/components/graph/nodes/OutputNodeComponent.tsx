import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import TypedHandle from "../TypedHandle";
import NodeRow from "../NodeRow";
import InputLabel from "../inputs/InputLabel";

export default function OutputNodeComponent() {
  return (
    <BaseNodeComponent title="Output">
      <NodeRow>
        <InputLabel label="Output" />
        <TypedHandle
          id="input"
          type="target"
          position={Position.Left}
          dataType="string"
        />
      </NodeRow>
    </BaseNodeComponent>
  );
}
