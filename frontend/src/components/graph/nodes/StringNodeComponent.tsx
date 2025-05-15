import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import TypedHandle from "../TypedHandle";
import { StringNodeProps } from "../types";
import NodeRow from "../NodeRow";

const selector = (id: string) => (store: GraphState) => ({
  setString: (string: string) =>
    store.setNodeValue(id, "string", "sources", { value: string }),
  value: store.getNodeValue(id, "string", "sources")?.value ?? "",
});

export default function StringNodeComponent(props: StringNodeProps) {
  const { value, setString } = useGraphStore(selector(props.id));

  return (
    <BaseNodeComponent title="String">
      <NodeRow>
        <StringInput
          label="String"
          value={value as string}
          onChange={(e) => setString(e.target.value)}
        />
        <TypedHandle
          id="string"
          type="source"
          position={Position.Right}
          dataType="string"
        />
      </NodeRow>
    </BaseNodeComponent>
  );
}
