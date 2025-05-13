type ControlledInputProps = {
  name: string;
  value: string | number | boolean;
};

export default function ControlledInput(props: ControlledInputProps) {
  return (
    <div className="p-1 flex items-center w-full">
      <span className="block text-xs text-gray-400 mr-2">{props.name}</span>
      <div className="flex items-center space-x-2 w-full overflow-x-hidden">
        <span className="nodrag border border-[#444] rounded text-xs text-gray-100 p-1 focus:outline-none h-6.5 w-38 text-nowrap truncate">
          {props.value}
        </span>
      </div>
    </div>
  );
}
