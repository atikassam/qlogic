import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import {
  QLogicEnvironmentLazyData,
  QLogicEnvironmentLazyDataOption,
} from '../../lib/QLogicEnvironment';

type DefineLazyDataType = Blockly.Block & {
  isInitialized: boolean;
  customData: {
    level: number;
    path: {
      id: string;
      index?: number | string;
    }[];
  };
  renderOptions: () => void;
  renderOption: (opts: {
    name: string;
    label?: string;
    isList?: boolean;
    options: QLogicEnvironmentLazyDataOption[];
  }) => void;
};

function getLevel(
  options: QLogicEnvironmentLazyDataOption[],
  id: string
): number {
  const findLevel = (
    options: QLogicEnvironmentLazyDataOption[],
    id: string,
    level: number
  ): number => {
    for (const option of options) {
      if (option.id === id) {
        return level;
      }
      if (option.next) {
        const nestedLevel = findLevel(option.next, id, level + 1);
        if (nestedLevel !== -1) {
          return nestedLevel;
        }
      }
    }
    return -1;
  };

  return findLevel(options, id, 0);
}

const DefineLazyData = {
  register: (func: QLogicEnvironmentLazyData) => {
    if (javascript.javascriptGenerator.forBlock[DefineLazyData.name(func)]) {
      return;
    }

    Blockly.common.defineBlocks({
      [DefineLazyData.name(func)]: DefineLazyData.Block(func),
    });
    javascript.javascriptGenerator.forBlock[DefineLazyData.name(func)] =
      DefineLazyData.Generator(func) as any;
  },

  name: (func: Pick<QLogicEnvironmentLazyData, 'name'>) =>
    `lazy_data_${func.name}`,

  Block: (func: QLogicEnvironmentLazyData) =>
    ({
      customData: {
        level: 0,
        path: [] as DefineLazyDataType['customData']['path'],
      },

      init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this.appendDummyInput(func.name).appendField(func.name);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(true);
        this.setColour(172);

        this.renderOptions();
      },

      mutationToDom() {
        const container = Blockly.utils.xml.createElement('mutation');

        this.customData.path.forEach((pathItem, index) => {
          const indexInputName = `OPT_${index + 1}_INDEX`;
          const input = this.getInput(indexInputName);
          if (!input) return;
          const connection = input.connection?.targetBlock();
          if (connection) pathItem.index = indexInputName;
        });

        container.setAttribute('data', JSON.stringify(this.customData));
        console.log('Saving mutation:', this.customData);
        return container;
      },

      domToMutation(xmlElement) {
        const data = xmlElement.getAttribute('data');
        if (data) {
          this.customData = JSON.parse(data);
        }
        this.renderOptions();

        // Restore field values
        this.customData.path.forEach((value, index) => {
          const fieldName = `OPT_${index}`;
          const field = this.getField(fieldName);
          if (field) {
            field.setValue(value.id);
          } else {
            console.warn(`Field ${fieldName} does not exist.`);
          }
        });

        console.log('Restored mutation:', this.customData);
      },

      renderOption(opts: {
        name: string;
        label?: string;
        isList?: boolean;
        options: QLogicEnvironmentLazyDataOption[];
      }) {
        const { name, label, options, isList } = opts;

        // Dropdown for options
        const dropdown = new Blockly.FieldDropdown(
          options.map((option) => [option.label, option.id]),
          (optionId) => {
            const selectedLevel = getLevel(func.options, optionId);

            // Reset deeper levels if the selected option changes the path
            if (selectedLevel < this.customData.level) {
              this.customData.path = this.customData.path.slice(
                0,
                selectedLevel
              );
              this.customData.level = selectedLevel;

              // Remove inputs corresponding to deeper levels (including index fields)
              for (let i = selectedLevel + 1; i <= this.inputList.length; i++) {
                const fieldName = `OPT_${i}`;
                const indexFieldName = `${fieldName}_INDEX`;

                if (this.getInput(fieldName)) this.removeInput(fieldName);
                if (this.getInput(indexFieldName)) this.removeInput(indexFieldName, true);
              }
            }

            // Update path and level
            const currentOption = options.find((opt) => opt.id === optionId);
            this.customData.path[this.customData.level] = {
              id: optionId,
              index: currentOption?.isList ? 0 : undefined, // Default index to 0 if isList is true
            };
            this.customData.path = this.customData.path.slice(
              0,
              this.customData.level + 1
            );
            this.customData.level = this.customData.path.length;

            this.renderOptions();
            return optionId;
          }
        );

        // Create or update the dropdown field
        if (this.getInput(name)) this.removeInput(name);
        const input = this.appendDummyInput(name);

        // Add index field if isList is true
        if (isList) {
          const indexFieldName = `${name}_INDEX`;
          if (this.getInput(indexFieldName)) this.removeInput(indexFieldName);
          this.appendValueInput(indexFieldName)
            .appendField('At')
            .setAlign(Blockly.inputs.Align.RIGHT);
        }

        if (label) input.appendField(label);
        input.appendField(dropdown, name);
      },

      renderOptions() {
        const getOption = (
          paths: DefineLazyDataType['customData']['path'],
          options: QLogicEnvironmentLazyDataOption[],
          index = 0
        ): QLogicEnvironmentLazyDataOption[] => {
          const option = options.find((opt) => opt.id === paths[index]?.id);
          if (!option) return [];
          if (!option.next) return [option];
          return [option, ...getOption(paths, option.next, index + 1)];
        };

        if (this.customData.path.length === 0) {
          this.renderOption({
            name: `OPT_${this.customData.level}`,
            // label: func.name,
            options: func.options,
          });
          return;
        }

        const options = getOption(this.customData.path, func.options);
        options.forEach((option, index) => {
          const fieldName = `OPT_${index + 1}`;
          if (!option.next) return; // Skip if no further options

          if (!this.getField(fieldName)) {
            this.renderOption({
              name: fieldName,
              // label: func.name,
              options: option.next,
              isList: option.isList,
            });
          }
        });
      },
    } as DefineLazyDataType),

  Generator:
    (func: QLogicEnvironmentLazyData) => (block: DefineLazyDataType, generator: javascript.JavascriptGenerator) => {
      let path = '['
      block.customData.path.forEach((pathItem, index) => {
        if (index > 0) path += ',';
        path += `'${pathItem.id}'`;

        if (typeof pathItem.index === 'string') {
          // path.push(generator.valueToCode(block, pathItem.index, javascript.Order.ATOMIC));
          path += ', ' + generator.valueToCode(block, pathItem.index, javascript.Order.ATOMIC);
        }
      })

      path += ']';
      const code = `await ${func.name}(${path});`;
      return `${code}\n`;
    },
};

export default DefineLazyData;
