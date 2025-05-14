import { Handle, Position } from "@xyflow/react";
import { VariableType } from "../../graph/types";

const colorMap: Record<string, string> = {
  string: "#6366f1", // indigo
  number: "#22c55e", // Green
  boolean: "#f59e0b", // Amber
};

type TypedHandleProps = {
  type: "source" | "target";
  position: Position;
  id: string;
  dataType: VariableType;
};

export default function TypedHandle(props: TypedHandleProps) {
  return (
    <Handle
      id={props.id}
      type={props.type}
      position={props.position}
      className="w-3 h-3 rounded-full border border-black"
      style={{
        backgroundColor: colorMap[props.dataType],
        width: "10px",
        height: "10px",
      }}
    />
  );
}
