import { useEffect, useRef } from "react";
import { useTweakPane } from "../../hooks/useTweakPane";
import { FolderApi, Pane } from "tweakpane";
import { VariableEntry } from "../../tweakpane/types";

let PANE: Pane | null = null;
let FOLDER: FolderApi | null = null;
const globals: Record<string, VariableEntry> = {
  llm_model: {
    name: "llm_model",
    type: "string",
    value: "What is the weather like in Tulsa, Oklahoma?",
  },
};

const styles = {
  visible: "opacity-100 pointer-events-auto",
  hidden: "opacity-0 pointer-events-none",
};

export default function GlobalVariableEditor(props: { visible?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { current: pane } = useTweakPane({
    title: "",
    container: ref,
  });

  if (!PANE && pane) {
    PANE = pane;
  }

  useEffect(() => {
    if (pane !== null) {
      const folder = pane.addFolder({ title: "Global Variables" });
      FOLDER = folder;
      const addBtn = pane.addButton({ title: "Add Variable" });
      addBtn.on("click", () => {
        const key = crypto.randomUUID().slice(0, 6);
        globals[key] = {
          type: "string",
          value: "",
          name: key,
        };
        if (FOLDER) {
          FOLDER.addBinding(globals, key, { view: "variable-entry" });
        }
      });
    }
  }, [pane]);

  return (
    <div
      ref={ref}
      className={`w-full max-w-64 h-auto ml-4 mt-22 z-100 absolute ${
        props.visible ? styles.visible : styles.hidden
      }`}
    ></div>
  );
}
