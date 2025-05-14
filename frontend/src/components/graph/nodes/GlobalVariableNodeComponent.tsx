import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import DropdownInput from "../inputs/DropdownInput";
import { useState } from "react";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";
import ControlledInput from "../inputs/ControlledInput";
import { Data, Port } from "../../../graph/types";

export type VariableNodeProps = {
  id: string;
  data: {
    targets: { variableName: Port<"string"> };
    sources: { output: Port<"any"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setVariable: (variableName: string, output: string | number | boolean) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      targets: {
        ...(node.data.targets as object),
        variableName: {
          ...(node.data.targets as Data).variableName,
          value: variableName,
        },
      },
      sources: {
        ...(node.data.sources as object),
        output: {
          ...(node.data.sources as Data).output,
          value: output,
        },
      },
    });
    store.propagateValueToDownstream(id, "output", output);
  },
  getVariableList: store.getVariableList,
});

export default function GlobalVariableNodeComponent(props: VariableNodeProps) {
  const [value, setValue] = useState("llm_model");
  const { setVariable, getVariableList } = useGraphStore(
    selector(props.id),
    shallow
  );

  const varValue =
    getVariableList().filter((v) => v.id === value)[0]?.value ?? "";
  return (
    <BaseNodeComponent title="Global Variable">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <div className="flex flex-row flex-nowrap">
          <div className="flex-grow flex-1 flex items-center">
            <DropdownInput
              label=""
              value={value}
              options={getVariableList().map((v) => ({
                key: v.name,
                value: v.id,
              }))}
              onChange={(e) => {
                setValue(e.target.value);
                setVariable(
                  e.target.value,
                  useGraphStore
                    .getState()
                    .getActiveGraph()
                    .getVariable(e.target.value)
                    ?.toString() ?? ""
                );
              }}
            />
          </div>
          <div className="flex-grow flex-1 flex items-center">
            <ControlledInput name="" value={varValue} />
          </div>
        </div>
        <Handle
          id="output"
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-red"
        />
      </div>
    </BaseNodeComponent>
  );
}
