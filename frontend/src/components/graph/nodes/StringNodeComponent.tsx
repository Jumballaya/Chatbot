import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { Port } from "../../../graph/types";

export type StringNodeProps = {
  id: string;
  data: {
    targets: { string: Port<"string"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setString: (string: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      targets: {
        ...(node.data.targets as object),
        string: {
          ...((node.data.targets as any).string as object),
          value: string,
        },
      },
    });
  },
  string: (store.nodes.find((v) => v.id === id)?.data.targets as any).string,
});

export default function StringNodeComponent(props: StringNodeProps) {
  const node = useGraphStore(selector(props.id));

  return (
    <BaseNodeComponent title="String">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <StringInput
          label="String"
          value={node.string}
          onChange={(e) => node.setString(e.target.value)}
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
