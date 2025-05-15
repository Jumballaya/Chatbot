import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import NumberInput from "../inputs/NumberInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import TypedHandle from "../TypedHandle";
import { NumberNodeProps } from "../types";
import NodeRow from "../NodeRow";

const selector = (id: string) => (store: GraphState) => ({
  setNumber: (number: number) =>
    store.setNodeValue(id, "number", "sources", { value: number }),
  number: store.getNodeValue(id, "number", "sources"),
});

export default function NumberNodeComponent(props: NumberNodeProps) {
  const node = useGraphStore(selector(props.id));

  return (
    <BaseNodeComponent title="Number">
      <NodeRow>
        <NumberInput
          label="Number"
          value={(node.number?.value as number) ?? 0}
          onChange={(e) => {
            node.setNumber(Number(e.target.value));
          }}
        />
        <TypedHandle
          id="number"
          type="source"
          position={Position.Right}
          dataType="number"
        />
      </NodeRow>
    </BaseNodeComponent>
  );
}
