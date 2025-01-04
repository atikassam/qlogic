import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { QLogicEnvironmentFunc } from '../../lib/QLogicEnvironment';
import DefineFunc from './define-func';

export function defineFunctionBlock(func: QLogicEnvironmentFunc) {
  if (javascript.javascriptGenerator.forBlock[DefineFunc.name(func)]) return;

  Blockly.common.defineBlocks({
    [DefineFunc.name(func)]: DefineFunc.Block(func),
  });
  javascript.javascriptGenerator.forBlock[DefineFunc.name(func)] = DefineFunc.Generator(func) as any;
}