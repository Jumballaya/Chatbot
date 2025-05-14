import { Position } from "@xyflow/react";
import BaseNodeComponent from "./BaseNodeComponent";
import DropdownInput from "../inputs/DropdownInput";
import { useEffect, useState } from "react";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import { shallow } from "zustand/shallow";
import ControlledInput from "../inputs/ControlledInput";
import type {
  Data,
  Port,
  VariableType,
  VariableValue,
} from "../../../graph/types";
import TypedHandle from "../TypedHandle";

//
//
//  @TODO: Create a useGlobalVariable() hook
//          I want the global variable editor to live-update the
//          GlobalVariableNodeComponent so that it updates the
//          downstream nodes as well
//
//

export type VariableNodeProps = {
  id: string;
  data: {
    sources: { output: Port<"any"> };
  };
};

const selector = (id: string) => (store: GraphState) => ({
  setOutput: (value: VariableValue, type: VariableType) => {
    const node = store.nodes.find((v) => v.id === id);
    if (!node) return;
    store.updateNode(id, {
      sources: {
        ...(node.data.sources as object),
        output: {
          ...(node.data.sources as Data).output,
          value,
          type,
        },
      },
    });
    store.propagateValueToDownstream(id, "output", value);
  },
  getVariableList: store.getVariableList,
  getActiveGraph: store.getActiveGraph,
});

export default function GlobalVariableNodeComponent(props: VariableNodeProps) {
  const { setOutput, getVariableList, getActiveGraph } = useGraphStore(
    selector(props.id),
    shallow
  );
  const [varName, setVarName] = useState<string>("");
  const [varVal, setVarVal] = useState<VariableValue>("");
  const [varType, setVarType] = useState<VariableType>("string");

  useEffect(() => {
    const varDef = getActiveGraph().getVariableDef(varName);
    if (varDef) {
      setOutput(varDef.value, varDef.type);
      setVarVal(varDef.value);
      setVarType(varDef.type);
    }
  }, [varName]);

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
            <ControlledInput name="" value={varVal} />
          </div>
        </div>
        <TypedHandle
          id="output"
          type="source"
          position={Position.Right}
          dataType={varType}
        />
      </div>
    </BaseNodeComponent>
  );
}
