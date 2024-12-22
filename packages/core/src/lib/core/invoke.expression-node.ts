import { ExpressionNode } from './expression-node';

export type InvokeEventTypes = 'invoked';

export class InvokeExpressionNode extends ExpressionNode<InvokeEventTypes> {
  type = 'invoke';
  actionUID?: string;

  setAction(actionUID: string) {
    this.actionUID = actionUID;
    return this;
  }

  override async eval(): Promise<any> {
    const action = this.parentBlock?.getExpressionByUid(this.actionUID!);
    if (!action) throw new Error(`Action with uid ${this.actionUID} not found`);

    return action.eval();
  }

  override toJSON() {
    return {
      uid: this.uid,
      type: this.type,
      actionUID: this.actionUID,
    };
  }
}
