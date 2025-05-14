import { useEffect } from "react";
import { VariableValue } from "../graph/types";

export default function usePropagateTargetToSource(
  connected: boolean,
  targetValue: VariableValue,
  sourceValue: VariableValue,
  setOutput: (v: VariableValue) => void
) {
  useEffect(() => {
    if (connected && targetValue !== sourceValue) {
      setOutput(targetValue);
    }
  }, [connected, targetValue, sourceValue]);
}
