import * as Blockly from 'blockly';
import { OptionArgType } from '../../lib/QLogicEnvironment';

export const optionsToBlockDropDown = (
  block: Blockly.Block,
  options: OptionArgType['options']
) => {
  // block.on
  return new Blockly.FieldDropdown(
    Array.isArray(options)
      ? options.map((option) => [option.label, option.value])
      : () => {
          if (typeof options === 'function') {
            return options().map((option) => [option.label, option.value]);
          }
          return [];
        }
  );
};
