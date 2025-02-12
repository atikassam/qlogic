import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';

export default {
  name: 'IsTruthyValue',
  Block: {
    init: function () {
      this.appendValueInput('NAME')
        .appendField('Boolean');
      this.setOutput(true, ['Boolean']);
      this.setTooltip('');
      this.setHelpUrl('');
      this.setColour(225);
    },
  } as any,

  Generator: (
    block: Blockly.Block,
    generator: javascript.JavascriptGenerator
  ) => {
    const value = generator.valueToCode(block, 'NAME', javascript.Order.ATOMIC);
    const code = `Boolean(${value})`;
    return [code, javascript.Order.NONE];
  },
};
