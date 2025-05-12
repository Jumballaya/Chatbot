import type { ChangeEvent } from "react";

type NumberInputProps = {
  label: string;
  value: number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  range?: boolean;
};

export default function NumberInput(props: NumberInputProps) {
  return (
    <div className="px-3 py-2">
      <label className="block text-xs text-gray-400 mb-1">Frequency (Hz)</label>
      <div className="flex items-center space-x-2">
        <input
          type={props.range ? "range" : "number"}
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onChange={props.onChange}
          className="nodrag w-full bg-[#111] border border-[#444] rounded text-sm text-gray-100 px-2 py-1 focus:outline-none"
        />
        <span className="text-xs text-gray-400">
          {props.unit && (
            <span className="text-xs text-gray-400">{props.unit}</span>
          )}
        </span>
      </div>
    </div>
  );
}
