import { ExecutionGraph } from "./ExecutionGraph";
import { NodeContext } from "./NodeContext";
import {
  Data,
  ExecutionUpdate,
  GraphNodeType,
  InputPort,
  NodeId,
  OnCompleteCB,
  OutputPort,
  RetryConfig,
} from "./types";

abstract class BaseNode<T extends GraphNodeType> {
  public abstract get retry(): RetryConfig;
  public abstract get id(): NodeId;
  public abstract get type(): T;

  public abstract inputs(): Record<string, InputPort>;
  public abstract outputs(): Record<string, OutputPort>;

  // Lifecycle hooks
  public abstract execute(context: NodeContext): AsyncIterable<ExecutionUpdate>;
  public abstract onComplete(
    result: Data,
    context: NodeContext
  ): void | Promise<void>;
}

export abstract class GraphNode<T extends GraphNodeType> extends BaseNode<T> {
  private readonly _id: NodeId;
  private readonly _type: T;
  private readonly _retry: RetryConfig;
  private _onComplete?: OnCompleteCB;

  public get retry(): RetryConfig {
    return this._retry;
  }
  public get id(): NodeId {
    return this._id;
  }
  public get type(): T {
    return this._type;
  }

  protected get onCompleteCB(): OnCompleteCB | undefined {
    return this._onComplete;
  }

  constructor(
    id: NodeId,
    type: T,
    retry: RetryConfig = { policy: "never" },
    onComplete?: OnCompleteCB
  ) {
    super();
    this._id = id;
    this._type = type;
    this._retry = retry;
    this._onComplete = onComplete;
  }
}
