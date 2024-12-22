import * as Blockly from 'blockly/core';

class CustomConstantProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    // Set up all of the constants from the base provider.
    super();
    this.GRID_UNIT = 4;
    this.MIN_BLOCK_HEIGHT = 4 * this.GRID_UNIT;
  }
}

export class CustomRenderer extends Blockly.zelos.Renderer {
  constructor() {
    super('CZelos');
  }

  override makeConstants_() {
    return new CustomConstantProvider();
  }
}