import { useEffect, useState } from "react";
import { ExecutionGraph } from "../graph/ExecutionGraph";
import { VariableType, VariableValue } from "../graph/types";

export default function useGlobalVariable(
  variableName: string,
  graph: ExecutionGraph
) {
  const [varVal, setVarVal] = useState<VariableValue>("");
  const [varType, setVarType] = useState<VariableType>("string");

  useEffect(() => {
    const varDef = graph.getVariableDef(variableName);
    if (varDef) {
      setVarVal(varDef.value);
      setVarType(varDef.type);
    }
  }, [variableName, graph]);

  return {
    value: varVal,
    type: varType,
  };
}
