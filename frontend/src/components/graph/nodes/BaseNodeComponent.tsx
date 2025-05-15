import { BaseNodeComponentProps } from "../types";

export default function BaseNodeComponent({
  title,
  children,
}: BaseNodeComponentProps) {
  return (
    <div className="bg-[#1e1e1e] text-gray-200 rounded-md border border-[#333] min-w-32 text-sm font-sans shadow-md relative">
      <div className="bg-[#111] text-white text-center font-semibold py-0.5 border-b border-[#333] rounded-t-md">
        {title}
      </div>
      <div className="grid grid-cols-[auto,1fr] gap-y-1 items-center py-1">
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}
