import { useEffect } from "react";
import { IOType, IOTypeMap } from "../graph/types";

export default function usePropagateTargetToSource(
  targetValue: IOTypeMap[IOType],
  sourceValue: IOTypeMap[IOType],
  setOutput: (v: IOTypeMap[IOType]) => void
) {
  useEffect(() => {
    if (targetValue !== sourceValue) {
      setOutput(targetValue);
    }
  }, [targetValue, sourceValue, setOutput]);
}
