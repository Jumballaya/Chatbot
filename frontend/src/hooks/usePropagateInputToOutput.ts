import { useEffect } from "react";
import { VariableValue } from "../graph/types";

export default function usePropagateTargetToSource(
  targetValue: VariableValue,
  sourceValue: VariableValue,
  setOutput: (v: VariableValue) => void
) {
  useEffect(() => {
    if (targetValue !== sourceValue) {
      setOutput(targetValue);
    }
  }, [targetValue, sourceValue, setOutput]);
}
