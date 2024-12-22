import EventEmitter from 'eventemitter3';
import { Block } from './block';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 10 });

/**
 * This is the base class for all blocks.
 *
 */
export abstract class ExpressionNode<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol
> extends EventEmitter<EventTypes> {
  public readonly uid = uid.rnd();

  private _parentBlock?: Block;

  set parentBlock(block: Block) {
    this._parentBlock = block;
  }

  get parentBlock() {
    if (!this._parentBlock) {
      throw new Error('This expression node is not added to a block');
    }

    return this._parentBlock;
  }

  abstract type: string;
  abstract eval(): Promise<any>;

  abstract toJSON(): any;
}