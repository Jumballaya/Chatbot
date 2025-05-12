import { useRef } from "react";
import { VariableEntry } from "../../tweakpane/types";
import useVariableFolder from "../../hooks/useVariableFolder";

const globals: Record<string, VariableEntry> = {
  initial_prompt: {
    name: "initial_prompt",
    type: "string",
    value: "What is the weather like in Tulsa, Oklahoma?",
  },
  llm_model: {
    name: "llm_model",
    type: "string",
    value: "gemma3:4b",
  },
};

const styles = {
  visible: "opacity-100 pointer-events-auto",
  hidden: "opacity-0 pointer-events-none",
};

export default function GlobalVariableEditor(props: { visible?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const folder = useVariableFolder(ref, {
    title: "Global Variables",
    variables: globals,
    onUpdate: (v) => {
      globals[v.name] = {
        name: v.name,
        type: v.type,
        value: v.value,
      };
    },
    onRemove: (key) => {
      delete globals[key];
    },
  });

  return (
    <div
      ref={ref}
      className={`w-full max-w-64 h-auto ml-4 mt-22 z-100 absolute ${
        props.visible ? styles.visible : styles.hidden
      }`}
    ></div>
  );
}
