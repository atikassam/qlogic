import { ExpressionNode } from '../expression-node';

class Expression extends ExpressionNode {
  type = 'expression';

  override eval(): Promise<any> {
    return Promise.resolve(undefined);
  }

  override toJSON(): any {}
}

describe('ExpressionNode', () => {
  it('should create Expression instance', () => {
    const expression = new Expression();
    expect(expression).toBeTruthy();
  });

  it('should have a type of expression', () => {
    const expression = new Expression();
    expect(expression.type).toEqual('expression');
  });

  it('should have an eval method', () => {
    const expression = new Expression();
    expect(expression.eval).toBeDefined();
  });

  it('should have a toJSON method', () => {
    const expression = new Expression();
    expect(expression.toJSON).toBeDefined();
  });

  it('should have a uid', () => {
    const expression = new Expression();
    expect(expression.uid).toBeDefined();
  });

  it('Should throw error on accessing parent block', async () => {
    const expression = new Expression();
    try {
      expression.parentBlock;
    } catch (e: any) {
      expect(e.message).toEqual('This expression node is not added to a block');
    }
  })
});
