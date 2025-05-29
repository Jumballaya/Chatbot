import BaseNodeComponent from "./BaseNodeComponent";
import { GraphNodeProps } from "../types";
import { getNodeTitle } from "../../../graph/reactNodeFactory";
import { SourceRow, TargetRow } from "./NodeRow";

export default function GraphNodeComponent(props: GraphNodeProps) {
  return (
    <BaseNodeComponent title={getNodeTitle(props.type)}>
      {Object.keys(props.data.sources ?? {}).map((k) => {
        return (
          <SourceRow id={props.id} key={`${props.id}-${k}`} attribute={k} />
        );
      })}
      {Object.keys(props.data.targets ?? {}).map((k) => {
        return (
          <TargetRow id={props.id} key={`${props.id}-${k}`} attribute={k} />
        );
      })}
    </BaseNodeComponent>
  );
}
