import { useLayoutEffect, useRef } from "react";
import { Pane } from "tweakpane";
import VariableEntryBundle from "../tweakpane/VariableEntryBundle";

type PaneConfig = {
  container?: React.RefObject<HTMLDivElement | null>;
  title?: string;
};

export function useTweakPane(config: PaneConfig) {
  const paneRef = useRef<Pane | null>(null);
  const container = config.container?.current;

  useLayoutEffect(() => {
    if (!container) return;
    const pane = new Pane({
      container: container,
    });

    pane.registerPlugin(VariableEntryBundle);

    paneRef.current = pane;

    return () => {
      paneRef.current = null;
      pane.dispose();
    };
  }, [container]);

  return paneRef;
}
