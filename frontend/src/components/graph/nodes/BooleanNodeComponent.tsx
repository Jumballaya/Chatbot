import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import TypedHandle from "../TypedHandle";
import BooleanInput from "../inputs/BooleanInput";
import { BooleanNodeProps } from "../types";

const selector = (id: string) => (store: GraphState) => ({
  setValue: (boolean: boolean) =>
    store.setNodeValue(id, "boolean", "sources", { value: boolean }),
  value: store.getNodeValue(id, "boolean", "sources")?.value ?? false,
});

export default function BooleanNodeComponent(props: BooleanNodeProps) {
  const { value, setValue } = useGraphStore(selector(props.id));

  return (
    <BaseNodeComponent title="Boolean">
      <div className="relative px-2 py-0.5 space-y-0.5">
        <BooleanInput
          label="Boolean"
          value={value}
          size="sm"
          onChange={setValue}
        />
        <TypedHandle
          id="boolean"
          type="source"
          position={Position.Right}
          dataType="boolean"
        />
      </div>
    </BaseNodeComponent>
  );
}
