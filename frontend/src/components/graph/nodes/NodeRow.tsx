import { Position } from "@xyflow/react";
import StringInput from "../inputs/StringInput";
import { GraphState, useGraphStore } from "../../../state/graphStore";
import TypedHandle from "./TypedHandle";
import { IOType, Port, PortDirection } from "../../../graph/types";
import NumberInput from "../inputs/NumberInput";
import BooleanInput from "../inputs/BooleanInput";
import InputLabel from "../inputs/InputLabel";

const selector = (id: string) => (store: GraphState) => ({
  getValue: (k: string, d: PortDirection) => store.getNodeValue(id, k, d),
  setValue: (k: string, d: PortDirection, v: Partial<Port<IOType>>) =>
    store.setNodeValue(id, k, d, v),
});

type RowInputProps = {
  value: Partial<Port<IOType>>;
  attribute: string;
  id: string;
  direction: PortDirection;
};

function RowInput(props: RowInputProps) {
  const { setValue } = useGraphStore(selector(props.id));
  const { value, attribute, direction } = props;
  if (!value.type) return <></>;

  switch (value.type) {
    case "string":
      return (
        <StringInput
          label={attribute}
          value={value.value as string}
          onChange={(e) =>
            setValue(attribute, direction, { value: e.target.value })
          }
        />
      );

    case "number":
      return (
        <NumberInput
          label={attribute}
          value={(value.value as number) ?? 0}
          onChange={(e) => {
            setValue(attribute, direction, { value: Number(e.target.value) });
          }}
        />
      );

    case "boolean":
      return (
        <BooleanInput
          label={attribute + "?"}
          value={(value.value as boolean) ?? false}
          size="sm"
          onChange={(e) => setValue(attribute, direction, { value: e })}
        />
      );

    default:
      return <></>;
  }
}

type RowProps = {
  id: string;
  attribute: string;
};

export function TargetRow(props: RowProps) {
  const { getValue } = useGraphStore(selector(props.id));
  const { attribute, id } = props;
  const value = getValue(attribute, "targets");

  return (
    <NodeRow>
      {value?.type ? (
        <RowInput
          value={value}
          attribute={attribute}
          id={id}
          direction="targets"
        />
      ) : (
        <></>
      )}
      {value?.type ? (
        <TypedHandle
          id={attribute}
          type="target"
          position={Position.Left}
          dataType={value.type}
        />
      ) : (
        <></>
      )}
    </NodeRow>
  );
}

export function SourceRow(props: RowProps) {
  const { getValue } = useGraphStore(selector(props.id));
  const { attribute } = props;
  const value = getValue(attribute, "sources");

  return (
    <NodeRow columns={1}>
      {value?.controlled && value?.type ? (
        <RowInput
          value={value}
          attribute={attribute}
          id={props.id}
          direction="sources"
        />
      ) : (
        <InputLabel label={attribute} position="end" maxWidth={32} />
      )}
      {value?.type ? (
        <TypedHandle
          id={attribute}
          type="source"
          position={Position.Right}
          dataType={value.type}
        />
      ) : (
        <></>
      )}
    </NodeRow>
  );
}

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
