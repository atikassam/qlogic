import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { optionsToBlockDropDown } from '../utill';
import DefineFunc from './define-func';
import { QLogicEnvironmentQFuncSerializable, QLogicExecutionOptionsSerializable } from '../../../lib/types';

export const DefineQFunc = {
  register: (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentQFuncSerializable) => {
    if (javascript.javascriptGenerator.forBlock[DefineQFunc.name(opts, func)]) {
      return;
    }

    Blockly.common.defineBlocks({
      [DefineQFunc.name(opts, func)]: DefineQFunc.Block(opts, func),
    });
    javascript.javascriptGenerator.forBlock[DefineQFunc.name(opts, func)] =
      DefineQFunc.Generator(opts, func) as any;
  },

  unregister: (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentQFuncSerializable) => {
    delete Blockly.Blocks[DefineQFunc.name(opts, func)];
    delete javascript.javascriptGenerator.forBlock[DefineQFunc.name(opts, func)];
  },

  name: (opts: QLogicExecutionOptionsSerializable, func: Pick<QLogicEnvironmentQFuncSerializable, 'name'>) =>
    `${opts.namespace}_qfunc_${func.name}`,

  /**
   * Create a Blockly block for a given QLogicEnvironment function.
   * @param opts The QLogicExecutionOptionsSerializable
   * @param func The QLogicEnvironmentFunc describing the function to create a block for.
   * @returns An object describing the block's initialization logic.
   */
  Block: (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentQFuncSerializable) =>
    ({
      applyStrictTypeCheck: [Blockly.ConnectionType.NEXT_STATEMENT, Blockly.ConnectionType.PREVIOUS_STATEMENT],
      init: function () {
        // Set the block's label with the function name
        this.appendDummyInput(func.name).appendField(func.label);

        if (func.conditional) {
          this.appendValueInput('conditional')
            .setAlign(Blockly.inputs.Align.RIGHT)
            .appendField('When')
        }

        if (func.allowedNext) {
          const types = func.allowedNext.map((next) => {
            if ('qfunc' in next) {
              return DefineQFunc.name(opts, { name: next.qfunc });
            } else if ('function' in next) {
              return DefineFunc.name(opts, { name: next.function });
            }

            return;
          }).filter(Boolean) as string[]

          if (types.length) this.setNextStatement(true, types);
          else this.setNextStatement(false);
        }

        if (func.allowedPrevious) {
          const types = func.allowedPrevious.map((next) => {
            if ('qfunc' in next) {
              return DefineQFunc.name(opts, { name: next.qfunc });
            } else if ('function' in next) {
              return DefineFunc.name(opts, { name: next.function });
            }

            return;
          }).filter(Boolean) as string[]

          if (types.length) this.setPreviousStatement(true, types);
          else this.setPreviousStatement(false);
        }

        this.appendStatementInput('logic')
          .setAlign(Blockly.inputs.Align.RIGHT);

        // Add inputs for each function argument
        func.returns?.forEach((arg) => {
          if (arg.type === 'options' && 'options' in arg) {
            // Use appendDummyInput for options with a dropdown
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
        this.setInputsInline(func.returns && func.returns?.length < 4);

        // Set the block's color
        this.setColour(172);
      },
    } as any),

  /**
   * Generate JavaScript code for a given block.
   * @param opts The QLogicExecutionOptionsSerializable
   * @param func The QLogicEnvironmentFunc describing the function.
   * @returns A generator function for Blockly.
   */
  Generator:
    (opts: QLogicExecutionOptionsSerializable, func: QLogicEnvironmentQFuncSerializable) =>
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
      let code = `await ${DefineQFunc.name(opts, func)}(await (async () => {\n` +
        `${statement_logic}` +
        `  return {\n${func.returns?.map((arg) => `    ${arg.name}: ${args.shift()}`).join(',\n')}\n  };\n` +
      `})());\n`;

      if (func.conditional) {
        const conditional = generator.valueToCode(block, 'conditional', javascript.Order.ATOMIC);
        code = `if (${conditional}) {\n${code}}\n`;
      }

      return code;
    },
};

export default DefineQFunc;