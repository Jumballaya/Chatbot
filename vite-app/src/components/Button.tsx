const primary =
  "px-4 py-2 rounded-md font-bold border-2 border-indigo-600 text-indigo-800 hover:border-indigo-400 hover:text-indigo-500 dark:hover:text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-500 dark:active:bg-indigo-700 dark:text-white cursor-pointer";
const destructive =
  "px-4 py-2 rounded-md font-bold bg-red-500 hover:bg-red-400 active:bg-red-600 cursor-pointer";
const disabled =
  "px-4 py-2 rounded-md font-bold bg-zinc-600 hover:bg-zinc-500 active:bg-zinc-700 cursor-pointer";

const classes = {
  primary,
  destructive,
  disabled,
};

type ButtonProps = {
  label: string;
  variant: keyof typeof classes;
  onClick?: () => void;
  disabled?: boolean;
};

export default function Button(props: ButtonProps) {
  return (
    <button
      disabled={props.disabled ?? false}
      onClick={props.onClick}
      className={classes[props.variant]}
    >
      {props.label}
    </button>
  );
}
