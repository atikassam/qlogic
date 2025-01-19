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
      indexed?: boolean;
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

const CreateSystemOptions = (id: string, name = '') => {
  return [
    {
      id: `${id}.self`,
      key: '__self__',
      label: `${name} Self`,
    },
    {
      id: `${id}.only`,
      key: '__at__',
      label: `${name} Only`,
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
        for (const path of this.extraState.path) {
          const input = this.getInput(identifier.index(path.index));
          path.indexed = !!input?.connection?.getSourceBlock().id;
        }
        return this.extraState;
      },

      loadExtraState(extraState) {
        this.extraState = extraState;
      },

      renderOption(opt, extraState) {
        const { index = 0, option } = opt;
        const _index = index - 1;

        if (!option.next) return;

        const id = identifier.id(index);

        this.removeInput(id, true);
        this.removeInput(identifier.system(_index), true);
        this.removeInput(identifier.index(_index), true);

        if (option.isList) {

          this.appendDummyInput(identifier.system(_index)).appendField(
            new FieldDropdown(
              CreateSystemOptions('').map((option) => [option.label, option.id]),
              (value) => {
                extraState.path[_index].self = value.endsWith('.self');

                if (value.endsWith('.only')) {
                  this.removeInput(identifier.index(_index), true);
                  this.appendValueInput(identifier.index(_index))
                    .appendField('Index')
                    .setCheck('Number');

                  if (this.getInput(identifier.id(_index)))
                    this.moveInputBefore(identifier.index(_index), identifier.id(index))
                } else {
                  this.removeInput(identifier.index(_index), true);
                }
                return value;
              }
            ),
            identifier.system(_index)
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
      for (const pathItem of block.extraState.path) {
        if (pathItem.index > 0) path += ', ';
        path += `'${pathItem.id}'`;
        if (pathItem.self) break;
        if (pathItem.indexed) {
          path +=
            ', ' +
            generator.valueToCode(
              block,
              identifier.index(pathItem.index),
              javascript.Order.ATOMIC
            );
        }
      }

      path += ']';
      const code = `await ${func.name}(${path});`;
      return `${code}\n`;
    },
};

export default DefineLazyData;
