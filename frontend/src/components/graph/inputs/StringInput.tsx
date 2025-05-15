import type { ChangeEvent } from "react";
import InputLabel from "./InputLabel";

type StringInputProps = {
  label: string;
  value: string;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function StringInput(props: StringInputProps) {
  return (
    <>
      <InputLabel label={props.label} />
      <input
        type="text"
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled ?? false}
        className="w-full text-xs bg-[#111] border border-[#444] rounded p-1 text-white"
        placeholder="Value"
      />
    </>
  );
}
