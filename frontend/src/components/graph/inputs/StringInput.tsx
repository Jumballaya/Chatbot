import type { ChangeEvent } from "react";

type StringInputProps = {
  label: string;
  value: string;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function StringInput(props: StringInputProps) {
  return (
    <div className="p-1 flex items-center">
      <label className="block text-xs text-gray-400 mr-2">{props.label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled ?? false}
          className="nodrag w-full bg-[#111] border border-[#444] rounded text-xs text-gray-100 p-1 focus:outline-none"
        />
      </div>
    </div>
  );
}
