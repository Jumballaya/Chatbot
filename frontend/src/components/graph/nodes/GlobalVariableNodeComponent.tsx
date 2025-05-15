import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import DropdownInput from "../inputs/DropdownInput";
import { useState } from "react";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";
import ControlledInput from "../inputs/ControlledInput";
import type { IOType, IOTypeMap } from "../../../graph/types";
import TypedHandle from "../TypedHandle";
import useGlobalVariable from "../../../hooks/useGlobalVariable";
import { VariableNodeProps } from "../types";

const selector = (id: string) => (store: GraphState) => ({
  setOutput: (output: IOTypeMap[IOType], type: IOType) =>
    store.setNodeValue(id, "output", "sources", { value: output, type }),
  outputValue: store.getNodeValue(id, "output", "sources")?.value ?? "",
  getVariableList: store.getVariableList,
  getActiveGraph: store.getActiveGraph,
});

export default function GlobalVariableNodeComponent(props: VariableNodeProps) {
  const { setOutput, getVariableList, getActiveGraph } = useGraphStore(
    selector(props.id),
    shallow
  );
  const [varName, setVarName] = useState<string>("");
  const { value, type } = useGlobalVariable(varName, getActiveGraph());

  return (
    <BaseNodeComponent title="Global Variable">
      <div className="relative px-1 py-0.5 space-y-0.5">
        <div className="flex flex-row flex-nowrap">
          <div className="flex-grow flex-1 flex items-center">
            <DropdownInput
              label=""
              value={varName}
              placeholder={"Click to Choose Variable"}
              options={getVariableList().map((v) => ({
                key: v.name,
                value: v.id,
              }))}
              onChange={(e) => {
                const variableName = e.target.value;
                const varDef = getActiveGraph().getVariableDef(e.target.value);
                if (varDef) {
                  setOutput(varDef.value, varDef.type);
                }
                setVarName(variableName);
              }}
            />
          </div>
          <div className="flex-grow flex-1 flex items-center">
            <ControlledInput name="" value={value} />
          </div>
        </div>
        <TypedHandle
          id="output"
          type="source"
          position={Position.Right}
          dataType={type}
        />
      </div>
    </BaseNodeComponent>
  );
}
