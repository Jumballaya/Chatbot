import type { ChangeEvent } from "react";
import InputLabel from "./InputLabel";

type NumberInputProps = {
  label: string;
  value: number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export default function NumberInput(props: NumberInputProps) {
  return (
    <>
      <InputLabel
        label={`${props.label} ${props.unit ? `(${props.unit})` : ""}`}
      />
      <input
        type="number"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={props.onChange}
        className="w-full text-xs bg-[#111] border border-[#444] rounded p-1 text-white"
        placeholder="Value"
      />
    </>
  );
}
