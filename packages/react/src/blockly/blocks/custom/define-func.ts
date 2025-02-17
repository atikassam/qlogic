import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { optionsToBlockDropDown } from '../utill';
import { QLogicEnvironmentFuncSerializable, QLogicExecutionOptionsSerializable } from '../../../lib/types';

export const DefineFunc = {
  register: (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentFuncSerializable) => {
    if (javascript.javascriptGenerator.forBlock[DefineFunc.name(opts, func)]) {
      return;
    }

    Blockly.common.defineBlocks({
      [DefineFunc.name(opts, func)]: DefineFunc.Block(opts, func),
    });
    javascript.javascriptGenerator.forBlock[DefineFunc.name(opts, func)] =
      DefineFunc.Generator(opts, func) as any;
  },

  unregister: (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentFuncSerializable) => {
    delete Blockly.Blocks[DefineFunc.name(opts, func)];
    delete javascript.javascriptGenerator.forBlock[DefineFunc.name(opts, func)];
  },

  name: (opts: QLogicExecutionOptionsSerializable, func: Pick<QLogicEnvironmentFuncSerializable, 'name'>) =>
    `${opts.namespace}_func_${func.name}`,

  /**
   * Create a Blockly block for a given QLogicEnvironment function.
   * @param func The QLogicEnvironmentFunc describing the function to create a block for.
   * @returns An object describing the block's initialization logic.
   */
  Block: (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentFuncSerializable) =>
    ({
      applyStrictTypeCheck: [Blockly.ConnectionType.NEXT_STATEMENT, Blockly.ConnectionType.PREVIOUS_STATEMENT],
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

        this.setOnChange(function (event: any) {
          if (event.type === Blockly.Events.BLOCK_MOVE) {
            // @ts-expect-error - Ignore the error
            this.updateConnections(func);
          }
        });
      },
      updateConnections: function () {
        const isConnectedAsValue = this.outputConnection?.isConnected();

        if (isConnectedAsValue) {
          // If connected as a value, remove statement connections
          this.setOutput(true, func.returnType === 'any' ? null : func.returnType);
          this.setPreviousStatement(false);
          this.setNextStatement(false);
        } else {

          // If not connected as a value, allow statements
          if (func.returnType && !this.previousConnection?.isConnected() && !this.nextConnection?.isConnected())
            this.setOutput(true, func.returnType === 'any' ? null : func.returnType);
          else this.setOutput(false);

          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        }
      }
    } as any),

  /**
   * Generate JavaScript code for a given block.
   * @param func The QLogicEnvironmentFunc describing the function.
   * @returns A generator function for Blockly.
   */
  Generator:
    (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentFuncSerializable) =>
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
      const code = `await ${DefineFunc.name(opts, func)}(${args.join(', ')})`;

      if (block.outputConnection?.isConnected()) {
        return [code, javascript.Order.AWAIT];
      }

      return code + ';\n';
    },
};

export default DefineFunc;