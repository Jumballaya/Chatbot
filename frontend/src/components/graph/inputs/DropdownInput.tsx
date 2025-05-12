import type { ChangeEvent } from "react";
import Select from "../../basic/Select";

type DropdownInputProps = {
  label: string;
  value: string;
  options: Array<{ key: string; value: string }>;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
};

export default function DropdownInput(props: DropdownInputProps) {
  return (
    <div className="p-1 w-full">
      <Select
        label={props.label}
        value={props.value}
        onChange={props.onChange}
        options={props.options}
        disabled={props.disabled ?? false}
      />
    </div>
  );
}
