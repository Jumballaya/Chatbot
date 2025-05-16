//      Node worker pool:
//        top of execute: find the start nodes
//        states:
//            standby       <-- hasn't been seen yet
//            pending       <-- started, but is waiting on a list of nodes to be completed
//            ready         <-- in the queue to be worked on
//            in_progress   <-- currently worked on
//            completed     <-- completed nodes & their contexts
//            failed        <-- one failed state should kill the run for now
//
//    Also need a way to merge contexts so pending nodes can eventually be worked with a full ctx
//
//        A node completes: check each pending node, check to see if it depends on this node
//        if so, merge this context into its context, and add to the nodeExecCtx map like
//        normal. If this was the last node, take it out of the pending group and put it in
//        the ready queue.
//
//
//                     pending --> ready --> working -->
//        standby ---> working ------------------------> completed / failed
//
//

import { NodeContext } from "./NodeContext";
import { NodeId, NodeStatus } from "./types";

export class ExecutionPool {
  private nodeStatus: Map<NodeId, NodeStatus> = new Map();
  private dependencies: Map<NodeId, NodeId[]> = new Map();
  private contexts: Map<NodeId, NodeContext> = new Map();
  private pool: Record<NodeStatus, Set<NodeId>> = {
    [NodeStatus.StandBy]: new Set(),
    [NodeStatus.Pending]: new Set(),
    [NodeStatus.Ready]: new Set(),
    [NodeStatus.InProgress]: new Set(),
    [NodeStatus.Completed]: new Set(),
    [NodeStatus.Failed]: new Set(),
  };

  public addDependency(node: NodeId, dep: NodeId) {
    let found = this.dependencies.get(node);
    if (!found) {
      found = [];
    }
    found.push(dep);
    this.dependencies.set(node, found);
  }

  public addContext(id: NodeId, ctx: NodeContext) {
    this.contexts.set(id, ctx);
  }

  public isNodeReady(id: NodeId) {
    const status = this.nodeStatus.get(id);
    if (!status) {
      throw new Error(`no node '${id}' exists`);
    }
    if (status === NodeStatus.Failed) return false;
    if (status === NodeStatus.Completed) return false;
    if (status === NodeStatus.InProgress) return false;
    if (status === NodeStatus.Ready) return true;

    const deps = this.dependencies.get(id);
    return !deps?.length;
  }

  public startWorking(id: NodeId) {
    const status = this.nodeStatus.get(id);
    if (!status) {
      throw new Error(`no node '${id}' exists to start working`);
    }
    if (status === NodeStatus.Failed) {
      throw new Error(`attempted to start failed node: '${id}'`);
    }
    if (status === NodeStatus.Completed) {
      throw new Error(`attempted to restart completed node: '${id}'`);
    }
    if (status === NodeStatus.InProgress) return;

    this.pool[status].delete(id);
    this.pool[NodeStatus.InProgress].add(id);
  }

  public fail(id: NodeId) {
    const status = this.nodeStatus.get(id);
    if (!status) {
      throw new Error(`no node '${id}' exists to fail`);
    }
    if (status === NodeStatus.Failed) return;
    if (status === NodeStatus.Completed) {
      throw new Error(`attempted to fail a completed node: '${id}'`);
    }
    this.pool[status].delete(id);
    this.pool[NodeStatus.Failed].add(id);
  }

  public complete(id: NodeId) {
    const status = this.nodeStatus.get(id);
    if (!status) {
      throw new Error(`no node '${id}' exists to complete`);
    }
    if (status === NodeStatus.Completed) return;
    if (status !== NodeStatus.InProgress) {
      throw new Error(
        `attempted to complete a node that was never started: '${id}'`
      );
    }
    this.pool[NodeStatus.InProgress].delete(id);
    this.pool[NodeStatus.Completed].add(id);
  }

  public load(list: NodeId[]) {
    for (const i of list) {
      this.nodeStatus.set(i, NodeStatus.StandBy);
      this.pool[NodeStatus.StandBy].add(i);
    }
  }

  public clear() {
    this.pool = {
      [NodeStatus.StandBy]: new Set(),
      [NodeStatus.Pending]: new Set(),
      [NodeStatus.Ready]: new Set(),
      [NodeStatus.InProgress]: new Set(),
      [NodeStatus.Completed]: new Set(),
      [NodeStatus.Failed]: new Set(),
    };
    this.nodeStatus.clear();
    this.dependencies.clear();
    this.contexts.clear();
  }
}
