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
      all?: boolean;
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

  onOptionSelected: (
    index: number,
    parent: QLogicEnvironmentLazyDataOption,
    option: QLogicEnvironmentLazyDataOption,
    extraState: DefineLazyDataType['extraState']
  ) => void;

  renderNextOption: (
    opts: {
      index: number;
      option: QLogicEnvironmentLazyDataOption;
    },
    extraState: DefineLazyDataType['extraState']
  ) => void;
  removeOption: (
    index: number,
    extraState: DefineLazyDataType['extraState']
  ) => void;
  renderOption: (
    opts: {
      index: number;
      option: QLogicEnvironmentLazyDataOption;
      onSelect?(index: number, option: QLogicEnvironmentLazyDataOption): void;
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
      id: `${id}.all`,
      key: '__all__',
      label: `${name} all`,
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

        this.setOutput(true);
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

      removeOption(index: number, extraState) {
        const removables = extraState.path.filter((item) => item.index > index);

        for (const item of removables) {
          this.removeInput(identifier.id(item.index), true);
          this.removeInput(identifier.system(item.index), true);
          this.removeInput(identifier.index(item.index), true);

          item.removed = true;
        }
      },
      onOptionSelected(index, parent, option, extraState) {
        if (!option.isList) {
          this.removeInput(identifier.index(index), true);
          this.removeInput(identifier.system(index), true);
          this.renderNextOption({ index, option }, extraState);
          return;
        }

        this.removeInput(identifier.system(index), true);
        this.removeInput(identifier.index(index), true);
        this.appendDummyInput(identifier.system(index)).appendField(
          new FieldDropdown(
            [
              ['All', '.all'],
              ['At', '.at'],
            ],
            (value) => {
              if (value === '.all') {
                extraState.path[index].all = true;
                this.removeOption(index, extraState);
                this.removeInput(identifier.index(index), true);
                return value;
              }

              if (value === '.at') {
                this.removeInput(identifier.index(index), true);
                this.appendValueInput(identifier.index(index))
                  .appendField('Index')
                  .setCheck('Number');

                if (this.getInput(identifier.id(index + 1)))
                  this.moveInputBefore(
                    identifier.index(index),
                    identifier.id(index + 1)
                  );

                this.renderNextOption({ index, option }, extraState);
              } else {
                this.removeInput(identifier.index(index), true);
              }
              return value;
            }
          ),
          identifier.system(index)
        );

        if (this.getInput(identifier.id(index + 1)))
          this.moveInputBefore(
            identifier.system(index),
            identifier.id(index + 1)
          );
      },
      renderNextOption(opt, extraState) {
        const { index = 0, option } = opt;
        if (!option.next) return;

        this.renderOption(
          {
            index: index + 1,
            option: option,
            onSelect: (index, selected) =>
              this.onOptionSelected(index, option, selected, extraState),
          },
          extraState
        );
      },
      renderOption(opt, extraState) {
        const { index = 0, option } = opt;

        const onSelect =
          opt.onSelect ??
          ((index, selected) =>
            this.onOptionSelected(index, option, selected, extraState));

        if (!option.next) return;
        const id = identifier.id(index);

        this.removeInput(id, true);
        const input = this.appendDummyInput(id);
        extraState.path[index] = { index };
        const dropdown = new Blockly.FieldDropdown(
          [
            [`Select ${option.label}`, '__none__'],
            ...option.next.map((option) => [option.label, option.id]),
          ] as [string, string][],
          (value) => {
            this.removeOption(index, extraState);

            if (extraState.path[index]) {
              extraState.path[index].id = value;
              extraState.path[index].removed = false;
            }
            if (!option.next) return value;

            const sOption = option.next.find((opt) => opt.id === value);
            if (!sOption) return;
            onSelect?.(index, sOption);
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

      let path = '[';
      for (const pathItem of block.extraState.path) {
        if (pathItem.removed) break;
        if (pathItem.index > 0) path += ', ';
        path += `{ id: '${pathItem.id}' }`;
        if (pathItem.all) break;
        if (pathItem.indexed) {
          const code = generator.valueToCode(
            block,
            identifier.index(pathItem.index),
            javascript.Order.ATOMIC
          );

          path += `, { index: ${code} }`

        }
      }

      path += ']';
      const code = `await ${func.name}(${path})`;
      return [code, javascript.Order.ATOMIC];
    },
};

export default DefineLazyData;
