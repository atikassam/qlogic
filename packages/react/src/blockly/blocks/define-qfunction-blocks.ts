import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import { QLogicEnvironmentQFuncSerializable } from '../../lib/QLogicEnvironment';
import DefineQFunc from './define-qfunc';

export function defineQFunctionBlock(func: QLogicEnvironmentQFuncSerializable) {
  if (javascript.javascriptGenerator.forBlock[DefineQFunc.name(func)]) return;

  Blockly.common.defineBlocks({
    [DefineQFunc.name(func)]: DefineQFunc.Block(func),
  });
  javascript.javascriptGenerator.forBlock[DefineQFunc.name(func)] =
    DefineQFunc.Generator(func) as any;
}