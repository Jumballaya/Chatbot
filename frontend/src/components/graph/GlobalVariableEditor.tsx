import { useRef } from "react";
import useVariableFolder from "../../hooks/useVariableFolder";
import { GraphState, useGraphStore } from "../../state/graphStore";

const styles = {
  visible: "opacity-100 pointer-events-auto",
  hidden: "opacity-0 pointer-events-none",
};

const selector = (s: GraphState) => ({
  getActiveGraph: s.getActiveGraph,
});

export default function GlobalVariableEditor(props: { visible?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const store = useGraphStore(selector);
  const graph = store.getActiveGraph();

  useVariableFolder(ref, {
    title: "Global Variables",
    variables: graph?.getVariables() ?? {},
    onUpdate: (v) => {
      if (graph?.hasVariableId(v.id)) {
        graph.updateVariable(v.id, {
          name: v.name,
          type: v.type,
          value: v.value,
        });
        return;
      }
      graph?.addVariable(v.name, v.type, v.value);
    },
    onRemove: (key) => {
      graph?.removeVariable(key);
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
