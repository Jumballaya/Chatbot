import InputLabel from "./InputLabel";

type ControlledInputProps = {
  name: string;
  value: string | number | boolean;
};

export default function ControlledInput(props: ControlledInputProps) {
  return (
    <>
      <InputLabel label={props.name} />
      <span className="nodrag border border-[#444] rounded text-xs text-gray-100 p-1 focus:outline-none h-6.5 w-38 text-nowrap truncate">
        {props.value}
      </span>
    </>
  );
}
