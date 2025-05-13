import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { useState } from "react";
import StringInput from "../inputs/StringInput";

export default function StringNodeComponent() {
  const [val, setVal] = useState("");

  return (
    <BaseNodeComponent title="String">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <StringInput
          label="String"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
        <Handle
          id="string"
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-red"
        />
      </div>
    </BaseNodeComponent>
  );
}
