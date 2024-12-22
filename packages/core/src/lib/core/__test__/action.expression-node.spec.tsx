import { ActionExpressionNode } from '../action.expression-node';

describe('ActionExpressionNode', () => {
  it('should create ActionExpressionNode instance', () => {
    const expression = new ActionExpressionNode();
    expect(expression).toBeTruthy();
  });

  it('should have a type of action', () => {
    const expression = new ActionExpressionNode();
    expect(expression.type).toEqual('action');
  });
});
