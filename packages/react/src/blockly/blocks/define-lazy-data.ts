import * as Blockly from 'blockly';
import * as javascript from 'blockly/javascript';
import {
  QLogicEnvironmentLazyData,
  QLogicEnvironmentLazyDataOption,
} from '../../lib/QLogicEnvironment';
import { FieldDropdown } from 'blockly';

type DefineLazyDataType = Blockly.Block & {
  isInitialized: boolean;
  extraState: {
    path: {
      id?: string;
      self?: boolean;
      index: number;
      removed?: boolean;
    }[];
  };
  renderOptions: () => void;
  rOptions: () => void;
  rOption: (params: {
    parent?: QLogicEnvironmentLazyDataOption;
    option: QLogicEnvironmentLazyDataOption;
  }) => void;

  renderOption: (
    opts: {
      index: number;
      option: QLogicEnvironmentLazyDataOption;
    },
    extraState: DefineLazyDataType['extraState']
  ) => void;

  renderOptionDetails: (opts: {
    name: string;
    label?: string;
    path: DefineLazyDataType['extraState']['path'][0];
    index: number;
    isList?: boolean;
    option: QLogicEnvironmentLazyDataOption;
    options: QLogicEnvironmentLazyDataOption[];
    parent?: QLogicEnvironmentLazyDataOption;
  }) => void;
};

const identifier = {
  id: (index: number) => `OPT_${index}`,
  system: (index: number) => `OPT_${index}_system`,
  index: (index: number) => `OPT_${index}_index`,
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

const appendSystemOptions = (
  ld: QLogicEnvironmentLazyData
): QLogicEnvironmentLazyData => {
  const addSystemOptions = <T extends QLogicEnvironmentLazyDataOption>(
    option: T
  ): T => {
    return {
      ...option,
      next: !option.next
        ? undefined
        : [
            ...option.next.map(addSystemOptions),
            ...CreateSystemOptions(option.id),
          ],
    };
  };

  return addSystemOptions(ld);
};

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
      extraState: {
        path: [] as DefineLazyDataType['extraState']['path'],
      },

      init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this.appendDummyInput(func.name).appendField(func.name);

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(true);
        this.setColour(172);

        this.renderOption({ index: 0, option: func }, this.extraState);
      },

      saveExtraState() {
        console.log('saveExtraState', this.extraState);
        return this.extraState;
      },

      loadExtraState(extraState) {
        this.extraState = extraState;
        console.log('loadExtraState', this.extraState);
        // this.renderOptions();

        // Restore field values
        // this.customData.path.forEach((value, index) => {
        //   const fieldName = `OPT_${index}`;
        //   const field = this.getField(fieldName);
        //   if (field) {
        //     field.setValue(value.id);
        //   } else {
        //     console.warn(`Field ${fieldName} does not exist.`);
        //   }
        // });
      },

      renderOption(opt, extraState) {
        console.log('RenderOption', opt.index, opt.option);
        const { index = 0, option } = opt;
        if (!option.next) return;

        const id = identifier.id(index);

        this.removeInput(id, true);
        this.removeInput(identifier.index(index), true);
        this.removeInput(identifier.system(index), true);

        if (option.isList) {
          this.appendDummyInput(identifier.system(index)).appendField(
            new FieldDropdown(
              CreateSystemOptions('').map((option) => [option.label, option.id]),
              (value) => {
                if (value.endsWith('.self')) extraState.path[index].self = true;
                if (value.endsWith('.only')) {
                  this.removeInput(identifier.index(index), true);
                  this.appendValueInput(identifier.index(index))
                    .appendField('Index')
                    .setCheck('Number');

                  if (this.getInput(identifier.id(index)))
                    this.moveInputBefore(identifier.index(index), identifier.id(index))
                } else {
                  this.removeInput(identifier.index(index), true);
                }
                return value;
              }
            ),
            identifier.system(index)
          );
        }

        const input = this.appendDummyInput(id);
        extraState.path[index] = { index };
        const dropdown = new Blockly.FieldDropdown(
          [
            [`Select ${option.label}`, '__none__'],
            ...option.next.map((option) => [option.label, option.id]),
          ] as [string, string][],
          (value) => {
            console.log('value', value);
            const removables = extraState.path.filter(
              (item) => item.index > index
            );

            for (const item of removables) {
              this.removeInput(identifier.id(item.index), true);
              this.removeInput(identifier.system(item.index), true);
              this.removeInput(identifier.index(item.index), true);

              item.removed = true;
            }

            if (extraState.path[index]) {
              extraState.path[index].id = value;
              extraState.path[index].removed = false;
            }
            if (!option.next) return value;

            const sOption = option.next.find((opt) => opt.id === value);
            if (!sOption) return;

            this.renderOption(
              { index: index + 1, option: sOption },
              extraState
            );
            return value;
          }
        );

        input.appendField(dropdown, id);
      },
    } as DefineLazyDataType;
  },

  Generator:
    (func: QLogicEnvironmentLazyData) =>
    (block: DefineLazyDataType, generator: javascript.JavascriptGenerator) => {
      console.log('Generator', block.extraState);

      let path = '[';
      (
        (block.extraState.path ? [] : []) as typeof block.extraState.path
      ).forEach((pathItem, index) => {
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
      const code = `await ${func.name}(${path});`;
      return `${code}\n`;
    },
};

export default DefineLazyData;
