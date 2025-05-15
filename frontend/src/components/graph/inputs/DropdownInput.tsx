import type { ChangeEvent } from "react";
import InputLabel from "./InputLabel";

type DropdownInputProps = {
  label: string;
  value: string;
  options: Array<{ key: string; value: string }>;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
};

const classes = {
  primary:
    "border-2 border-indigo-400 text-indigo-800 dark:bg-indigo-600 dark:text-white dark:border-transparent dark:hover:bg-indigo-500 dark:active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400",
  disabled: "bg-zinc-600 text-zinc-300 cursor-not-allowed opacity-70",
};

export default function DropdownInput(props: DropdownInputProps) {
  const { label, value, options, placeholder, onChange, disabled } = props;

  const id = `select-${props.label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <>
      <InputLabel label={label} />
      <select
        id={id}
        name={id}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`px-1 rounded-md text-xs border cursor-pointer w-full ${
          disabled ? classes.disabled : classes.primary
        }`}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map(({ key, value: val }) => (
          <option key={`${label}-${key}-${val}`} value={val}>
            {key}
          </option>
        ))}
      </select>
    </>
  );
}
