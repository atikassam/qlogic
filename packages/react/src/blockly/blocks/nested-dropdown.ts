import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';

export default {
  Block: (options: any, config: any) => ({
    init: function () {
      this.appendEndRowInput('dropdown')
        .appendField(config.label)
        .appendField(
          new Blockly.FieldDropdown(this.getOptions, this.validate),
          'selected_question'
        );
      this.setTooltip('gg');
      this.setHelpUrl('gggg');
      this.setColour(15);
      this.setOutput(true, 'String');
    },

    getOptions: function () {
      console.log(options);
      return options.map(({ label, value }: any) => [label, value]);
    },

    validate: function (newValue: any) {
      if (!newValue?.___dropdown_child___) return newValue;

      console.log('New Value:', newValue);
      this.getSourceBlock().updateDropdown(newValue);
      return newValue;
    },

    updateDropdown: function (newValue: any) {
      console.log('New Value:', newValue);
      this.appendDummyInput('Day')
        .appendField('day')
        .appendField(new Blockly.FieldDropdown(this.generateOptions), 'Day');
    },
  } as any),
  Generator: (pathPrefix: any) => (block: any, generator: any) => {
    const dropdownValue = block.getFieldValue('selected_question');
    return [
      "readInput('" + pathPrefix + '.' + dropdownValue + "')",
      javascript.Order.ATOMIC,
    ];
  },
};
