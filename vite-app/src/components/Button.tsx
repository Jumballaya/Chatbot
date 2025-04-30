const primary =
  "px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 cursor-pointer";
const destructive =
  "px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-500 active:bg-zinc-700 cursor-pointer";

const classes = {
  primary,
  destructive,
};

type ButtonProps = {
  label: string;
  variant: keyof typeof classes;
  onClick?: () => void;
};

export default function Button(props: ButtonProps) {
  return (
    <button onClick={props.onClick} className={classes[props.variant]}>
      {props.label}
    </button>
  );
}
