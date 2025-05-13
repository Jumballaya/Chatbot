import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import NumberInput from "../inputs/NumberInput";
import { useState } from "react";

export default function NumberNodeComponent() {
  const [val, setVal] = useState(0);

  return (
    <BaseNodeComponent title="Number">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <NumberInput
          label="Number"
          value={val}
          onChange={(e) => setVal(parseFloat(e.target.value))}
        />
        <Handle
          id="number"
          type="source"
          position={Position.Right}
          className="w-5 h-5"
        />
      </div>
    </BaseNodeComponent>
  );
}
