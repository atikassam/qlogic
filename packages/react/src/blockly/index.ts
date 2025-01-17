import * as Blockly from 'blockly';
import { toolboxJson } from './toolbox';
import './index.css';
import { theme } from './theme';
import { QLogicEnvironment } from '../lib/QLogicEnvironment';
import IsTruthyValue from './blocks/is-truthy-value';
import * as javascript from 'blockly/javascript';
import DefineFunc from './blocks/define-func';
import DefineQfunc from './blocks/define-qfunc';
import DefineLazyData from './blocks/define-lazy-data';

(function setupCommonBlocks() {
  Blockly.common.defineBlocks({
    [IsTruthyValue.name]: IsTruthyValue.Block,
  });
  javascript.javascriptGenerator.forBlock[IsTruthyValue.name] =
    IsTruthyValue.Generator as any;
})();

/**
 * Initialize the page once everything is loaded.
 */
export function init(opts: {
  sounds?: boolean;
  env?: QLogicEnvironment;
  initialState?: any;
}) {
  const { sounds, env, initialState } = opts;

  let toolboxString = JSON.stringify(toolboxJson);
  toolboxString = toolboxString.replace(
    /%\{BKY_VARIABLES_DEFAULT_NAME\}/g,
    Blockly.Msg.VARIABLES_DEFAULT_NAME
  );
  const toolbox = JSON.parse(toolboxString);

  if (env?.options) {
    QLogicEnvironment.PrepareBlockly(env.options);

    toolbox.contents.push({
      kind: 'CATEGORY',
      name: 'Functions',
      colour: 134,
      cssConfig: {
        row: 'blocklyTreeRow blocklyTreeRowLists',
      },
      contents: [
        ...(env.options.lazyData?.map((func) => ({
          kind: 'BLOCK',
          type: DefineLazyData.name(func),
        })) || []),
        ...(env.options.functions?.map((func) => ({
          kind: 'BLOCK',
          type: DefineFunc.name(func),
        })) || []),
        ...(env.options.qfuns?.map((func) => ({
          kind: 'BLOCK',
          type: DefineQfunc.name(func),
        })) || []),
      ],
    });
  }

  // Inject Blockly.
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox,
    renderer: 'thrasos',
    sounds: sounds ?? false,
    zoom: {
      maxScale: 1,
      minScale: 0.8,
      scaleSpeed: 1.2,
      pinch: true,
    },
    trashcan: false,
    theme: theme,
  });
  Blockly.serialization.workspaces.load(initialState ?? startBlocks, workspace);
  workspace.zoomToFit();

  const allowedRootBlocks = opts.env?.options?.allowedRootBlocks?.map((b) => {
    if ('qfunc' in b) return DefineQfunc.name({ name: b.qfunc });
    return DefineFunc.name({ name: b.function });
  });

  // Disable adding new blocks outside and selectively disable connected blocks
  workspace.addChangeListener(function (event) {
    if (
      !allowedRootBlocks ||
      !allowedRootBlocks.length ||
      !('blockId' in event) ||
      !event.blockId
    )
      return;

    const block = workspace.getBlockById(event.blockId as string);
    if (!block || !block.type) return;

    const disabled =
      (!allowedRootBlocks.includes(block.type) && !block.getParent()) ||
      !!block
        .getPreviousBlock()
        ?.hasDisabledReason('Block must be attached to an allowed block');
    console.log('block', disabled);
    disableBlocks(block, disabled);
  });

  return workspace;
}

function disableBlocks(block: Blockly.Block, disabled: boolean) {
  block.setDisabledReason(
    disabled,
    'Block must be attached to an allowed block'
  );

  const nextBlock = block.getNextBlock();
  if (nextBlock) disableBlocks(nextBlock, disabled);
}

/**
 * Initial blocks when loading page.
 */
const startBlocks = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'variables_set',
        x: 10,
        y: 10,
        fields: {
          VAR: { id: 'Count' },
        },
        inputs: {
          VALUE: {
            block: {
              type: 'math_number',
              fields: { NUM: 1 },
            },
          },
        },
        next: {
          block: {
            type: 'controls_whileUntil',
            fields: { MODE: 'WHILE' },
            inputs: {
              BOOL: {
                block: {
                  type: 'logic_compare',
                  fields: { OP: 'LTE' },
                  inputs: {
                    A: {
                      block: {
                        type: 'variables_get',
                        fields: {
                          VAR: { id: 'Count' },
                        },
                      },
                    },
                    B: {
                      block: {
                        type: 'math_number',
                        fields: { NUM: 3 },
                      },
                    },
                  },
                },
              },
              DO: {
                block: {
                  type: 'text_print',
                  inputs: {
                    TEXT: {
                      block: {
                        type: 'text',
                        fields: { TEXT: 'Hello World!' },
                      },
                    },
                  },
                  next: {
                    block: {
                      type: 'variables_set',
                      fields: {
                        VAR: { id: 'Count' },
                      },
                      inputs: {
                        VALUE: {
                          block: {
                            type: 'math_arithmetic',
                            fields: { OP: 'ADD' },
                            inputs: {
                              A: {
                                block: {
                                  type: 'variables_get',
                                  fields: {
                                    VAR: { id: 'Count' },
                                  },
                                },
                              },
                              B: {
                                block: {
                                  type: 'math_number',
                                  fields: { NUM: 1 },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
  variables: [],
};
