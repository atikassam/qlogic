import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { QLogicEnvironmentQFunc } from '../../lib/QLogicEnvironment';

export default {
  name: (func: Pick<QLogicEnvironmentQFunc, 'name'>) => `custom_qfunction_${func.name}`,

  /**
   * Create a Blockly block for a given QLogicEnvironment function.
   * @param func The QLogicEnvironmentFunc describing the function to create a block for.
   * @returns An object describing the block's initialization logic.
   */
  Block: (func: QLogicEnvironmentQFunc) =>
    ({
      init: function () {
        // Set the block's label with the function name
        this.appendDummyInput(func.name).appendField(func.name);
        this.appendStatementInput('logic')
          .setAlign(Blockly.inputs.Align.RIGHT);

        // Add inputs for each function argument
        func.returns?.forEach((arg) => {
          if (
            arg.type === 'options' &&
            'options' in arg &&
            arg.options?.length
          ) {
            // Use appendDummyInput for options with a dropdown
            this.appendDummyInput(arg.name)
              .appendField(arg.name)
              .appendField(
                new Blockly.FieldDropdown(
                  arg.options.map((option) => [option.label, option.value])
                ),
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
        this.setInputsInline(true);

        // Set the block's color
        this.setColour(172);
      },
    } as any),

  /**
   * Generate JavaScript code for a given block.
   * @param func The QLogicEnvironmentFunc describing the function.
   * @returns A generator function for Blockly.
   */
  Generator:
    (func: QLogicEnvironmentQFunc) =>
    (block: Blockly.Block, generator: javascript.JavascriptGenerator) => {
      // Map function arguments to their corresponding Blockly values
      const args =
        func.returns?.map((arg) => {
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

      const statement_logic = generator.statementToCode(block, 'logic');
      // Return the function call as a code string
      return `await ${func.name}(await (async () => {\n` +
        `${statement_logic}` +
        `  return {\n${func.returns?.map((arg) => `    ${arg.name}: ${args.shift()}`).join(',\n')}\n  };\n` +
      `})());\n`;
    },
};