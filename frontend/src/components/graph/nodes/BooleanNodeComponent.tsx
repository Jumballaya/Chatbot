import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { Port } from "../../../graph/types";
import TypedHandle from "../TypedHandle";
import BooleanInput from "../inputs/BooleanInput";

export type BooleanNodeProps = {
  id: string;
  data: {
    source: { boolean: Port<"boolean"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setValue: (boolean: boolean) =>
    store.setNodeValue(id, "boolean", "sources", boolean),
  value:
    (store.getNodeValue(id, "boolean", "sources")?.value as boolean) ?? false,
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
