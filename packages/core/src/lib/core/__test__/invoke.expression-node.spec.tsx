import { InvokeExpressionNode } from '../invoke.expression-node';
import { Block } from '../block';
import { ActionExpressionNode } from '../action.expression-node';


describe('ExpressionNode', () => {
  it('should create Expression instance', () => {
    const expression = new InvokeExpressionNode();
    expect(expression).toBeTruthy();
  });

  it('should have a type of invoke', () => {
    const expression = new InvokeExpressionNode();
    expect(expression.type).toEqual('invoke');
  });

  describe('eval', () => {
    const block = new Block({ isRootBlock: true });

    const expression = new InvokeExpressionNode();
    block.addExpression(expression);

    it('should throw error if action is not found', async () => {
      expression.setAction('action-uid');
      try {
        await expression.eval();
      } catch (e: any) {
        expect(e.message).toEqual('Action with uid action-uid not found');
      }
    });

    it('should return the result of the action', async () => {
      const action = new ActionExpressionNode();
      block.addExpression(action);

      action.eval = jest.fn().mockResolvedValue('result');
      expression.setAction(action.uid);

      await expect(expression.eval()).resolves.toEqual('result');
    });
  })
});
