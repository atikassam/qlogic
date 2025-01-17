import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { QLogicEnvironmentFunc } from '../../lib/QLogicEnvironment';
import { optionsToBlockDropDown } from './utill';

export default {
  name: (func: Pick<QLogicEnvironmentFunc, 'name'>) =>
    `custom_function_${func.name}`,

  /**
   * Create a Blockly block for a given QLogicEnvironment function.
   * @param func The QLogicEnvironmentFunc describing the function to create a block for.
   * @returns An object describing the block's initialization logic.
   */
  Block: (func: QLogicEnvironmentFunc) =>
    ({
      init: function () {
        // Set the block's label with the function name
        this.appendDummyInput().appendField(func.name);

        // Add inputs for each function argument
        func.args?.forEach((arg) => {
          if (arg.type === 'options' && 'options' in arg) {
            this.appendDummyInput(arg.name)
              .appendField(arg.name)
              .appendField(
                optionsToBlockDropDown(this, arg.options),
                arg.name
              );

            return;
          }

          // Use appendValueInput for non-option arguments
          const input = this.appendValueInput(arg.name)
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField(arg.name);

          if (arg.type && arg.type !== 'any') {
            input.setCheck(arg.type); // Set input type validation
          }
        });

        // Configure block connections
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(true);

        // Set the block's color
        this.setColour(172);

        // Configure block output if the function has a return type
        if (func.returnType) {
          this.setOutput(
            true,
            func.returnType === 'any' ? null : func.returnType
          );
        }
      },
    } as any),

  /**
   * Generate JavaScript code for a given block.
   * @param func The QLogicEnvironmentFunc describing the function.
   * @returns A generator function for Blockly.
   */
  Generator:
    (func: QLogicEnvironmentFunc) =>
    (block: Blockly.Block, generator: javascript.JavascriptGenerator) => {
      // Map function arguments to their corresponding Blockly values
      const args =
        func.args?.map((arg) => {
          if (arg.type === 'options') {
            // Get the selected value for dropdown options
            return `'${block.getFieldValue(arg.name) || 'null'}'`;
          } else {
            // Get the input value for other argument types
            return (
              generator.valueToCode(block, arg.name, javascript.Order.ATOMIC) ||
              'null'
            );
          }
        }) || [];

      // Return the function call as a code string
      const code = `await ${func.name}(${args.join(', ')})`;
      if (!func.returnType) return code + ';\n'; // Add semicolon for expressions
      return [code, javascript.Order.ATOMIC]; // Add newline only for statements
    },
};
