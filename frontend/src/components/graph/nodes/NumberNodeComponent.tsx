import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import NumberInput from "../inputs/NumberInput";
import { Data, Port } from "../../../graph/types";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import TypedHandle from "../TypedHandle";

export type NumberNodeProps = {
  id: string;
  data: {
    sources: { number: Port<"number"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setNumber: (number: number) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        number: {
          ...(node.data.sources as Data).number,
          value: number,
        },
      },
    });
    store.propagateValueToDownstream(id, "number", number);
  },
  number:
    (store.nodes.find((v) => v.id === id)?.data.sources as Data)?.number ?? 0,
});

export default function NumberNodeComponent(props: NumberNodeProps) {
  const node = useGraphStore(selector(props.id));

  return (
    <BaseNodeComponent title="Number">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <NumberInput
          label="Number"
          value={node.number.value ?? 0}
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
      </div>
    </BaseNodeComponent>
  );
}
