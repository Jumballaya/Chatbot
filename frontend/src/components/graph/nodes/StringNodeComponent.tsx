import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { Data, Port } from "../../../graph/types";
import TypedHandle from "../TypedHandle";

export type StringNodeProps = {
  id: string;
  data: {
    source: { string: Port<"string"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setString: (string: string) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      ...node.data,
      sources: {
        ...(node.data.sources as object),
        string: {
          ...(node.data.sources as Data).string,
          value: string,
        },
      },
    });
    store.propagateValueToDownstream(id, "string", string);
  },
  string: (store.nodes.find((v) => v.id === id)?.data.sources as Data).string,
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
        <TypedHandle
          id="string"
          type="source"
          position={Position.Right}
          dataType="string"
        />
      </div>
    </BaseNodeComponent>
  );
}
