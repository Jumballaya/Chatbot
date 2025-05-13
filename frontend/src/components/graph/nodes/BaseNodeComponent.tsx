import type { ReactNode } from "react";

type BaseNodeComponentProps = {
  title: string;
  children: ReactNode;
};

export default function BaseNodeComponent({
  title,
  children,
}: BaseNodeComponentProps) {
  return (
    <div
      className={`bg-[#1e1e1e] text-gray-200 rounded-md border border-[#333] min-w-32 text-sm font-sans shadow-md relative`}
    >
      <div className="bg-[#111] text-white text-center font-semibold py-0.5 border-b border-[#333] rounded-t-md">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
