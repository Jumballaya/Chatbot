import React from "react";

type NodeRowProps = {
  columns?: number;
  children: React.ReactNode;
};

export default function NodeRow(props: NodeRowProps) {
  return (
    <div
      className={`relative grid ${
        props.columns === 1
          ? "grid-cols-[auto_1fr] "
          : "grid-cols-[3rem_auto_1fr]"
      } items-center gap-x-3 px-2 py-1`}
    >
      {props.children}
    </div>
  );
}
