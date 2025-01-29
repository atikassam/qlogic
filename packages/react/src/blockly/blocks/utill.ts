import * as Blockly from 'blockly';
import { OptionArgType } from '../../lib/QLogicEnvironment';

export const optionsToBlockDropDown = (
  block: Blockly.Block,
  options: OptionArgType['options']
) => {
  return new Blockly.FieldDropdown(
    options.map((option) => [
      option.label,
      option.value
    ])
  );
};
