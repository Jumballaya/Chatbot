const base =
  "rounded-md font-bold dark:text-white dark:hover:text-white border-2";

const primary =
  "cursor-pointer border-indigo-600 text-indigo-800 hover:border-indigo-400 hover:text-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-500 dark:active:bg-indigo-700 ";
const destructive =
  "cursor-pointer dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-600 text-red-600 border-2 border-red-400 hover:text-red-400 hover:border-red-300 dark:border-red-500 dark:hover:border-red-600";
const disabled = "dark:bg-zinc-600 dark:border-zinc-600 cursor-not-allowed";

const small = "px-2 py-1";
const large = "px-4 py-2";

const sizes = {
  sm: small,
  lg: large,
};

const classes = {
  primary,
  destructive,
  disabled,
};

type ButtonProps = {
  label: string;
  variant: keyof typeof classes;
  size?: keyof typeof sizes;
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button(props: ButtonProps) {
  return (
    <button
      disabled={props.disabled ?? false}
      onClick={props.disabled ? undefined : props.onClick}
      className={`${base} ${sizes[props.size ?? "lg"]} ${
        classes[props.variant]
      }`}
    >
      {props.label}
    </button>
  );
}
