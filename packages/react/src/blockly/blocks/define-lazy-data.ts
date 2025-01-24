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
    option: QLogicEnvironmentLazyDataOption
  ) => void;

  renderNextOption: (opts: {
    index: number;
    option: QLogicEnvironmentLazyDataOption;
  }) => void;
  removeOption: (index: number) => void;
  renderOption: (opts: {
    index: number;
    option: QLogicEnvironmentLazyDataOption;
    onSelect?(index: number, option: QLogicEnvironmentLazyDataOption): void;
  }) => void;

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
      extraState: null as any,
      // extraState: { path: [] } as any,

      init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('extraState', this.id, JSON.stringify(this.extraState));

        if (!this.extraState) {
          this.extraState = {
            path: [],
          };
        }

        this.appendDummyInput(func.name).appendField(func.name);

        this.setOutput(true);
        this.setInputsInline(true);
        this.setColour(172);

        this.renderOption({ index: 0, option: func });
      },

      saveExtraState(_self) {
        console.log(_self);
        for (const path of this.extraState.path) {
          const input = this.getInput(identifier.index(path.index));
          path.indexed = !!input?.connection?.getSourceBlock().id;
        }

        console.log(
          'Saving extraState',
          this.id,
          JSON.stringify(this.extraState)
        );
        return this.extraState;
      },

      loadExtraState(extraState) {
        this.extraState = extraState;
        console.log('extraState', this.id, JSON.stringify(this.extraState));
      },

      removeOption(index: number) {
        const removables = this.extraState.path.filter(
          (item) => item.index > index
        );

        for (const item of removables) {
          this.removeInput(identifier.id(item.index), true);
          this.removeInput(identifier.system(item.index), true);
          this.removeInput(identifier.index(item.index), true);

          item.removed = true;
        }
      },
      onOptionSelected(index, parent, option) {
        if (!option.isList) {
          this.removeInput(identifier.index(index), true);
          this.removeInput(identifier.system(index), true);
          this.renderNextOption({ index, option });
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
            function (value) {
              // @ts-expect-error - this is a block
              const block = this.getSourceBlock() as DefineLazyDataType;
              if (value === '.all') {
                block.extraState.path[index].all = true;
                block.removeOption(index);
                block.removeInput(identifier.index(index), true);
                return value;
              }

              if (value === '.at') {
                block.removeInput(identifier.index(index), true);
                block
                  .appendValueInput(identifier.index(index))
                  .appendField('Index')
                  .setCheck('Number');

                if (block.getInput(identifier.id(index + 1)))
                  block.moveInputBefore(
                    identifier.index(index),
                    identifier.id(index + 1)
                  );

                block.renderNextOption({ index, option });
              } else {
                block.removeInput(identifier.index(index), true);
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
      renderNextOption(opt) {
        const { index = 0, option } = opt;
        if (!option.next) return;

        this.renderOption({
          index: index + 1,
          option: option,
          onSelect: (index, selected) =>
            this.onOptionSelected(index, option, selected),
        });
      },
      renderOption(opt) {
        const { index = 0, option } = opt;

        const onSelect =
          opt.onSelect ??
          ((index, selected) =>
            this.onOptionSelected(index, option, selected));

        if (!option.next) return;
        const id = identifier.id(index);

        this.removeInput(id, true);
        const input = this.appendDummyInput(id);
        this.extraState.path[index] = { index };
        const dropdown = new Blockly.FieldDropdown(
          [
            [`Select ${option.label}`, '__none__'],
            ...option.next.map((option) => [option.label, option.id]),
          ] as [string, string][],
          function (value) {
            // @ts-expect-error - this is a block
            const block = this.getSourceBlock() as DefineLazyDataType;

            block.removeOption(index);
            if (block.extraState.path[index]) {
              block.extraState.path[index].id = value;
              block.extraState.path[index].removed = false;
              console.log('Selected', value, block.extraState);
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
      console.log('block', block.extraState);
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

          path += `, { index: ${code} }`;
        }
      }

      path += ']';
      const code = `await ${func.name}(${path})`;
      return [code, javascript.Order.ATOMIC];
    },
};

export default DefineLazyData;
