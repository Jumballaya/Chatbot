import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { Port } from "../../../graph/types";
import TypedHandle from "../TypedHandle";

export type StringNodeProps = {
  id: string;
  data: {
    source: { string: Port<"string"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setString: (string: string) =>
    store.setNodeValue(id, "string", "sources", string),
  value: store.getNodeValue(id, "string", "sources")?.value ?? "",
});

export default function StringNodeComponent(props: StringNodeProps) {
  const { value, setString } = useGraphStore(selector(props.id));

  return (
    <BaseNodeComponent title="String">
      <div className="relative px-1 py-0.5 space-y-0.5">
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
      </div>
    </BaseNodeComponent>
  );
}
