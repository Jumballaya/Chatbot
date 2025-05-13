import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import NumberInput from "../inputs/NumberInput";
import { Port } from "../../../graph/types";
import { GraphState, useGraphStore } from "../../../state/graphStore";

export type NumberNodeProps = {
  id: string;
  data: {
    targets: { number: Port<"number"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setNumber: (number: number) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      targets: {
        ...(node.data.targets as object),
        number: {
          ...((node.data.targets as any).number as object),
          value: number,
        },
      },
    });
  },
  number: (store.nodes.find((v) => v.id === id)?.data.targets as any).number,
});

export default function NumberNodeComponent(props: NumberNodeProps) {
  const node = useGraphStore(selector(props.id));

  return (
    <BaseNodeComponent title="Number">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <NumberInput
          label="Number"
          value={node.number.value}
          onChange={(e) => {
            node.setNumber(Number(e.target.value));
          }}
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
