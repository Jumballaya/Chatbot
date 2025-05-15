import { useRef } from "react";
import useVariableFolder from "../../hooks/useVariableFolder";
import { GraphState, useGraphStore } from "../../state/graphStore";

const styles = {
  visible: "opacity-100 pointer-events-auto",
  hidden: "opacity-0 pointer-events-none",
};

const selector = (s: GraphState) => ({
  globals: s.getActiveGraph()?.globals,
});

export default function GlobalVariableEditor(props: { visible?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { globals } = useGraphStore(selector);

  useVariableFolder(ref, {
    title: "Global Variables",
    variables: globals?.getVariables() ?? {},
    onUpdate: (v) => {
      if (globals?.hasVariableId(v.id)) {
        globals.updateVariable(v.id, {
          name: v.name,
          type: v.type,
          value: v.value,
        });
        return;
      }
      globals?.addVariable(v.name, v.type, v.value);
    },
    onRemove: (key) => {
      globals?.removeVariable(key);
    },
  });

  return (
    <div
      ref={ref}
      className={`w-full max-w-84 h-auto mt-17 z-100 absolute ${
        props.visible ? styles.visible : styles.hidden
      }`}
    ></div>
  );
}
