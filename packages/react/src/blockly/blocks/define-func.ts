import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { QLogicEnvironmentFunc } from '../../lib/QLogicEnvironment';

export default {
  Block: (func: QLogicEnvironmentFunc) =>
    ({
      init: function () {
        this.appendDummyInput().appendField(func.name);
        func.args?.forEach((arg) => {
          this.appendValueInput(arg.name).setCheck(arg.type);
        });

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      },
    } as any),
  Generator: (func: QLogicEnvironmentFunc) => (
    block: Blockly.Block,
    generator: javascript.JavascriptGenerator
  ) => {
    const args = func.args?.map((arg) => generator.valueToCode(block, arg.name, 0) || 'null') || [];
    return `${func.name}(${args.join(', ')});\n`;
  },
};
