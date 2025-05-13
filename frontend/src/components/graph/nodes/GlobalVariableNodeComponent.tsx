import { Handle, Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import StringInput from "../inputs/StringInput";
import DropdownInput from "../inputs/DropdownInput";
import { useState } from "react";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";

export type VariableNodeProps = {
  id: string;
  data: {
    variableName: string;
    string: string;
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setVariable: (variableName: string, string: string) =>
    store.updateNode(id, { variableName, string }),
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
            <StringInput label="" value={varValue.toString()} disabled={true} />
          </div>
        </div>
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
