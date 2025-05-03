import { ChatModel } from "../state/chatStore";

export type SelectOption = {
  key: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (value: ChatModel) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
};

const classes = {
  primary:
    "bg-indigo-600 text-white border-transparent hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400",
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
    <div className="flex items-center space-x-2">
      <span className="text-sm text-zinc-400">{label}:</span>

      <select
        id={id}
        name={id}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value as ChatModel)}
        className={`h-8 px-3 rounded-md text-sm border cursor-pointer ${
          disabled ? classes.disabled : classes.primary
        }`}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map(({ key, value: val }) => (
          <option
            key={`${label}-${key}-${val}`}
            value={val}
            className="bg-indigo-600 text-white"
          >
            {val}
          </option>
        ))}
      </select>
    </div>
  );
}
