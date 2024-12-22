import { ExpressionNode } from './expression-node';

export type ActionEventTypes = 'invoked';

export class ActionExpressionNode extends ExpressionNode<ActionEventTypes> {
  type = 'action';

  override eval(): Promise<any> {
    return Promise.resolve(undefined);
  }

  override toJSON() {
    return {
      uid: this.uid,
      type: this.type,
    };
  }
}
