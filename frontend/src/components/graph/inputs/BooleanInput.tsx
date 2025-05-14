type BooleanInputProps = {
  label: string;
  value: boolean;
  disabled?: boolean;
  size?: "sm" | "lg";
  onChange?: (v: boolean) => void;
};

const btnClassBase =
  "rounded bg-gray-700 flex items-center transition-colors duration-200";
const btnClassSize: Record<"sm" | "lg", string> = {
  lg: "w-10 h-6 border-4",
  sm: "w-6 h-4 border-2",
};
const btnClassFalse = "border-gray-700 bg-gray-700";
const btnClassTrue = "border-orange-400 bg-orange-400";
const btnClass = (v: boolean, size: "sm" | "lg" = "lg", disabled = false) =>
  `${btnClassBase} ${btnClassSize[size]} ${
    v && !disabled ? btnClassTrue : btnClassFalse
  }`;

const sliderClassBase = "bg-white transform transition-transform duration-200";
const sliderClassSize: Record<"sm" | "lg", string> = {
  lg: "w-4 h-4 rounded-sm",
  sm: "w-2 h-2 rounded-xs",
};
const sliderTrue: Record<"sm" | "lg", string> = {
  lg: "translate-x-4",
  sm: "translate-x-3",
};
const sliderFalse = "translate-x-0";
const sliderClass = (v: boolean, size: "sm" | "lg" = "lg", disabled = false) =>
  `${sliderClassBase} ${sliderClassSize[size]} ${
    v && !disabled ? sliderTrue[size] : sliderFalse
  }`;

export default function BooleanInput(props: BooleanInputProps) {
  return (
    <div className="p-0.5 flex items-center justify-around">
      <label className="block text-xs text-gray-400 mr-2">{props.label}</label>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => props?.onChange?.(!props.value)}
          className={btnClass(props.value, props.size, props.disabled)}
          role="switch"
          aria-checked={props.value}
          aria-label="Toggle boolean"
        >
          <div
            className={sliderClass(props.value, props.size, props.disabled)}
          />
        </button>
      </div>
    </div>
  );
}
