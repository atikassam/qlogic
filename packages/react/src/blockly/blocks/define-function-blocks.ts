import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { QLogicEnvironment, QLogicEnvironmentFunc } from '../../lib/QLogicEnvironment';
import DefineFunc from './define-func';
const func_name = (func: QLogicEnvironmentFunc) => `custom_function_${func.name}`;
export function defineFunctionBlock(func: QLogicEnvironmentFunc) {
  Blockly.common.defineBlocks({
    [func_name(func)]: DefineFunc.Block(func),
  });
  javascript.javascriptGenerator.forBlock[func_name(func)] = DefineFunc.Generator(func) as any;
}

export function defineFunctionBlocks(ctx: QLogicEnvironment, toolbox?: any) {
  if (!ctx.options?.functions) return;

  ctx.options.functions?.forEach(defineFunctionBlock);
  if (toolbox) {
    toolbox.contents.push({
      kind: 'CATEGORY',
      name: 'Functions',
      colour: 134,
      cssConfig: {
        row: 'blocklyTreeRow blocklyTreeRowLists',
      },
      contents: ctx.options.functions?.map((func) => ({
        kind: 'BLOCK',
        type: func_name(func),
      })),
    });
  }
}