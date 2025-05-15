type InputLabelProps = {
  label: string;
  position?: "start" | "end";
  maxWidth?: number;
};

export default function InputLabel(props: InputLabelProps) {
  const w = props.maxWidth ?? 14;
  return (
    <label
      className={`text-right text-xs text-gray-400 justify-self-end overflow-hidden max-w-${w} truncate ${
        props.position === "end" ? "col-start-2 w-full mr-3" : ""
      }`}
    >
      {props.label}
    </label>
  );
}
