import { ExpressionNode } from './expression-node';
import { InvokeExpressionNode } from './invoke.expression-node';
import { ActionExpressionNode } from './action.expression-node';

export type BlockEventTypes = 'expression-added';

/**
 * This is the base class for all blocks.
 *
 */
export class Block extends ExpressionNode<BlockEventTypes> {
  static readonly builders = new Map<string, {new(...args: any[]): ExpressionNode}>([
    ['invoke', InvokeExpressionNode],
    ['action', ActionExpressionNode],
  ]);

  static register(expression:{new(...args: any[]): ExpressionNode}) {
    Block.builders.set(expression.prototype.type, expression);
  }

  type = 'block';
  expressions: ExpressionNode[] = [];
  private readonly isRootBlock: boolean;

  constructor(options?: { isRootBlock?: boolean }) {
    super();

    this.isRootBlock = options?.isRootBlock ?? false;
  }

  addExpression(expression: ExpressionNode) {
    this.expressions.push(expression);
    expression.parentBlock = this;

    this.emit('expression-added', expression);
    return this;
  }

  toJSON() {
    return {
      uid: this.uid,
      type: this.type,
      expressions: this.expressions.map((e) => e.toJSON()),
    };
  }

  getExpressionByUid(uid: string): ExpressionNode | undefined {
    const expression =  this.expressions.find((e) => e.uid === uid);

    if (expression) return expression;
    else if (!this.isRootBlock) return this.parentBlock?.getExpressionByUid(uid);

    return undefined;
  }

  override eval(): Promise<any> {
    return Promise.all(this.expressions.map((e) => e.eval()));
  }
}
