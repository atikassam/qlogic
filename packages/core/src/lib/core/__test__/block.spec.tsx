import { Block } from '../block';
import { expect } from '@storybook/jest';

describe('Block', () => {
  it('Should have a type of block', () => {
    const block = new Block();
    expect(block.type).toEqual('block');
  });

  it('Should have a builders map', () => {
    expect(Block.builders instanceof Map).toEqual(true);
  });

  it('Should have a registerNode method', () => {
    expect(Block.register).toBeDefined();
  });

  it('Should have an eval method', () => {
    const block = new Block();
    expect(block.eval).toBeDefined();
  });

  it('Should have an expressions array', () => {
    const block = new Block();
    expect(Array.isArray(block.expressions)).toEqual(true);
  });

  it('should have an addExpression method', () => {
    const block = new Block();
    expect(block.addExpression).toBeDefined();
  });


  describe('addExpression', () => {
    const block = new Block();

    it('Should add an expression to the expressions array', () => {
      const expression = new Block();
      block.addExpression(expression);
      expect(block.expressions).toContain(expression);
    });

    it('Should emit expression-added event', () => {
      const expression = new Block();
      const spy = jest.fn();
      block.on('expression-added', spy);
      block.addExpression(expression);
      expect(spy).toHaveBeenCalledWith(expression);
    });

    it('Should set the expression block to the current block', () => {
      const expression = new Block();
      block.addExpression(expression);
      expect(expression.parentBlock).toEqual(block);
    });

    it('Should return the block', () => {
      const expression = new Block();
      expect(block.addExpression(expression)).toEqual(block);
    });
  });

  it('Should have a toJSON method', () => {
    const block = new Block();
    expect(block.toJSON).toBeDefined();
  });

  describe('toJSON', () => {
    it('Should return a JSON representation of the block', () => {
      const block = new Block();
      const expression = new Block();
      block.addExpression(expression);
      expect(block.toJSON()).toEqual({
        uid: block.uid,
        type: 'block',
        expressions: [expression.toJSON()],
      });
    });

    it('Should return a JSON representation of the block with multiple expressions', () => {
      const block = new Block();
      const expression1 = new Block();
      const expression2 = new Block();
      block.addExpression(expression1).addExpression(expression2);
      expect(block.toJSON()).toEqual({
        uid: block.uid,
        type: 'block',
        expressions: [expression1.toJSON(), expression2.toJSON()],
      });
    });
  });

  describe('eval', () => {
    it('Should return a array', async () => {
      const block = new Block();
      const expression = new Block();
      block.addExpression(expression);

      await expect(Array.isArray(await block.eval())).toEqual(true);
    });
  });
});
