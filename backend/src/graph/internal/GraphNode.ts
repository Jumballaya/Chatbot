import { NodeContext } from "./NodeContext";
import {
  Data,
  ExecutionUpdate,
  GraphNodeType,
  InputPort,
  NodeId,
  OutputPort,
  RetryConfig,
} from "./types";

abstract class BaseNode<T extends GraphNodeType> {
  public abstract get retry(): RetryConfig;
  public abstract get id(): NodeId;
  public abstract get type(): T;

  public abstract inputs(): Record<string, InputPort>;
  public abstract outputs(): Record<string, OutputPort>;

  public abstract execute(context: NodeContext): AsyncIterable<ExecutionUpdate>;
}

export abstract class GraphNode<T extends GraphNodeType> extends BaseNode<T> {
  private readonly _id: NodeId;
  private readonly _type: T;
  private readonly _retry: RetryConfig;

  public get retry(): RetryConfig {
    return this._retry;
  }
  public get id(): NodeId {
    return this._id;
  }
  public get type(): T {
    return this._type;
  }

  constructor(id: NodeId, type: T, retry: RetryConfig = { policy: "never" }) {
    super();
    this._id = id;
    this._type = type;
    this._retry = retry;
  }
}
