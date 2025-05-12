import React from "react";

export type SelectOption = {
  key: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
};

const classes = {
  primary:
    "border-2 border-indigo-400 text-indigo-800 dark:bg-indigo-600 dark:text-white dark:border-transparent dark:hover:bg-indigo-500 dark:active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400",
  disabled: "bg-zinc-600 text-zinc-300 cursor-not-allowed opacity-70",
};

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: Props) {
  const id = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex items-center space-x-2 w-full">
      {label && (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {label}:
        </span>
      )}

      <select
        id={id}
        name={id}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`h-6 px-1 rounded-md text-sm border cursor-pointer w-full ${
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
    </div>
  );
}
