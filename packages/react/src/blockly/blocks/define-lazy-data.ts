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
      self?: boolean;
      index?: number | string;
    }[];
  };
  renderOptions: () => void;
  rOptions: () => void;
  rOption: (params: {
    parent?: QLogicEnvironmentLazyDataOption;
    option: QLogicEnvironmentLazyDataOption;
  }) => void;

  renderOption: (opts: {
    name: string;
    label?: string;
    path: DefineLazyDataType['customData']['path'][0];
    level: number;
    isList?: boolean;
    options: QLogicEnvironmentLazyDataOption[];
  }) => void;
};

const CreateSystemOptions = (id: string) => {
  return [
    {
      id: `${id}.self`,
      key: '__self__',
      label: 'Self',
    },
    {
      id: `${id}.only`,
      key: '__at__',
      label: 'Only',
    },
  ];
};

const appendSystemOptions = (ld: QLogicEnvironmentLazyData) => {
  const addSystemOptions = (option: QLogicEnvironmentLazyDataOption) => {
    return {
      ...option,
      next: !option.next
        ? undefined
        : [...option.next, ...CreateSystemOptions(option.id)],
    };
  };

  return {
    ...ld,
    options: [
      ...CreateSystemOptions(ld.name),
      ...ld.options.map(addSystemOptions),
    ],
  };
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

  Block: (_func: QLogicEnvironmentLazyData) => {
    const func = appendSystemOptions(_func);

    return {
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
          const systemInputName = `OPT_${index + 1}_SYSTEM`;
          console.log('Serializing path', systemInputName);
          const systemInputField = this.getField(systemInputName) as Blockly.FieldDropdown
          if (systemInputField) {
            pathItem.self = systemInputField.getValue() === '.self';
          }

          const indexInputName = `OPT_${index + 1}_INDEX`;
          const input = this.getInput(indexInputName);
          if (input) {
            const connection = input.connection?.targetBlock();
            if (connection) pathItem.index = indexInputName;
          }

        });

        container.setAttribute('data', JSON.stringify(this.customData));
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
      },

      renderOption(opts: {
        name: string;
        label?: string;
        isList?: boolean;
        path: DefineLazyDataType['customData']['path'][0];
        options: QLogicEnvironmentLazyDataOption[];
      }) {
        const { name, label, options, path, isList } = opts;

        console.log('Render path', path);
        // Dropdown for options
        const dropdown = new Blockly.FieldDropdown(
          options.map((option) => [option.label, option.id]),
          (optionId) => {
            const selectedLevel = getLevel(func.options, optionId);

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
                const systemFieldName = `${fieldName}_SYSTEM`;

                if (this.getInput(fieldName)) this.removeInput(fieldName);
                if (this.getInput(indexFieldName))
                  this.removeInput(indexFieldName, true);
                if (this.getInput(systemFieldName))
                  this.removeInput(systemFieldName, true);
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

        // Add index field if isList is true
        if (isList) {
          const indexFieldName = `${name}_INDEX`;
          if (this.getInput(indexFieldName)) this.removeInput(indexFieldName);

          const systemFieldName = `${name}_SYSTEM`;
          console.log('Adding index field', indexFieldName);
          this.appendDummyInput(systemFieldName).appendField(
            new Blockly.FieldDropdown(
              CreateSystemOptions('').map((opt) => [opt.label, opt.id]),
              (optionId) => {
                if (optionId !== '.only') {
                  if (this.getInput(indexFieldName))
                    this.removeInput(indexFieldName);
                  return optionId;
                }

                this.appendValueInput(indexFieldName)
                  .appendField('At')
                  .setAlign(Blockly.inputs.Align.RIGHT);
                return optionId;
              }
            ),
            systemFieldName
          );
        }

        // Create or update the dropdown field
        if (this.getInput(name)) this.removeInput(name);
        const input = this.appendDummyInput(name);

        if (label) input.appendField(label);
        input.appendField(dropdown, name);
      },

      renderOptions() {
        const getOption = (
          paths: DefineLazyDataType['customData']['path'],
          options: QLogicEnvironmentLazyDataOption[],
          index = 0
        ): {
          path: DefineLazyDataType['customData']['path'][0];
          option: QLogicEnvironmentLazyDataOption;
        }[] => {
          const option = options.find((opt) => opt.id === paths[index]?.id);
          if (!option) return [];
          const segment = { path: paths[index], option };
          if (!option.next) return [segment];
          return [segment, ...getOption(paths, option.next, index + 1)];
        };

        if (this.customData.path.length === 0) {
          this.renderOption({
            path: this.customData.path[0],
            name: `OPT_${this.customData.level}`,
            level: this.customData.level,
            options: func.options,
          });
          return;
        }

        const options = getOption(this.customData.path, func.options);
        options.forEach(({ option, path }, index) => {
          const level = index + 1;
          const fieldName = `OPT_${level}`;
          console.log('Rendering option', option, path);
          if (!option.next || path.self) {
            console.log('Skipping option', option.next);

            if (this.getField(fieldName)) this.removeInput(fieldName);
            return;
          } // Skip if no further options

          if (!this.getField(fieldName)) {
            this.renderOption({
              path,
              name: fieldName,
              level: level,
              options: option.next,
              isList: option.isList,
            });
          }
        });
      },
    } as DefineLazyDataType;
  },

  Generator:
    (func: QLogicEnvironmentLazyData) =>
    (block: DefineLazyDataType, generator: javascript.JavascriptGenerator) => {
      let path = '[';
      block.customData.path.forEach((pathItem, index) => {
        if (index > 0) path += ', ';
        path += `'${pathItem.id}'`;

        if (typeof pathItem.index === 'string') {
          path +=
            ', ' +
            generator.valueToCode(
              block,
              pathItem.index,
              javascript.Order.ATOMIC
            );
        }
      });

      path += ']';
      console.log('Path:', block.customData);
      const code = `await ${func.name}(${path});`;
      return `${code}\n`;
    },
};

export default DefineLazyData;
