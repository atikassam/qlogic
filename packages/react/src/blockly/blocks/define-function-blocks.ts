import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { QLogicEnvironmentFunc } from '../../lib/QLogicEnvironment';
import DefineFunc from './define-func';

export const funcName = (func: QLogicEnvironmentFunc) =>
  `custom_function_${func.name}`;

export function defineFunctionBlock(func: QLogicEnvironmentFunc) {
  Blockly.common.defineBlocks({
    [funcName(func)]: DefineFunc.Block(func),
  });
  javascript.javascriptGenerator.forBlock[funcName(func)] = DefineFunc.Generator(func) as any;
}