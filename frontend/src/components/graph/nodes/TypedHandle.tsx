import { Handle, Position } from "@xyflow/react";
import { IOType } from "../../graph/types";

const colorMap: Record<string, string> = {
  string: "#6366f1", // indigo
  number: "#22c55e", // Green
  boolean: "#f59e0b", // Amber
};

type TypedHandleProps = {
  type: "source" | "target";
  position: Position;
  id: string;
  dataType: IOType;
};

export default function TypedHandle(props: TypedHandleProps) {
  return (
    <Handle
      id={props.id}
      type={props.type}
      position={props.position}
      style={{
        backgroundColor: colorMap[props.dataType],
        width: "12px",
        height: "12px",
        borderWidth: "2px",
      }}
    />
  );
}
