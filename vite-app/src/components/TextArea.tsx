import { useState } from "react";

type TextAreaProps = {
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
};

export default function TextArea(props: TextAreaProps) {
  const [lastKeyPressed, setLastKeyPressed] = useState("");

  return (
    <textarea
      onChange={(e) => {
        props?.onChange?.(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && lastKeyPressed != "Shift") {
          props?.onSubmit?.((e.target as HTMLTextAreaElement).value);
        }
        if (e.key === "Enter" && lastKeyPressed != "Shift") {
          return;
        }
        setLastKeyPressed(e.key);
      }}
      value={props.value}
      disabled={props.disabled ?? false}
      placeholder={props.placeholder ?? "Type your prompt..."}
      className="flex-1 resize-none rounded-md p-2 border border-zinc-700 bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}
