import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import NumberInput from "./inputs/NumberInput";
import { useState } from "react";

export default function StringNode() {
  const [val, setVal] = useState(0);

  return (
    <BaseNodeComponent title="Gain">
      <NumberInput
        label="Gain"
        value={val}
        onChange={(e) => setVal(parseFloat(e.target.value))}
        min={0}
        max={1}
        step={0.01}
        unit="%"
        range={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-black"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-red"
      />
    </BaseNodeComponent>
  );
}
