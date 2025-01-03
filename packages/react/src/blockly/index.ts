import * as Blockly from 'blockly';
import { toolboxJson } from './toolbox';
import './index.css';
import { theme } from './theme';
import { QLogicEnvironment } from '../lib/QLogicEnvironment';
import { funcName } from './blocks/define-function-blocks';

/**
 * Initialize the page once everything is loaded.
 */
export function init(ctx?: QLogicEnvironment) {
  let loadOnce = null;
  try {
    loadOnce = window.sessionStorage.getItem('loadOnceBlocks');
    window.sessionStorage.removeItem('loadOnceBlocks');
    if (loadOnce) loadOnce = JSON.parse(loadOnce);
  } catch (e) {
    // Storage can be flakey.
    console.log(e);
  }

  let toolboxString = JSON.stringify(toolboxJson);
  toolboxString = toolboxString.replace(
    /%\{BKY_VARIABLES_DEFAULT_NAME\}/g,
    Blockly.Msg.VARIABLES_DEFAULT_NAME,
  );
  const toolbox = JSON.parse(toolboxString);

  if (ctx?.options) {
    QLogicEnvironment.PrepareBlockly(ctx.options);

    toolbox.contents.push({
      kind: 'CATEGORY',
      name: 'Functions',
      colour: 134,
      cssConfig: {
        row: 'blocklyTreeRow blocklyTreeRowLists',
      },
      contents: ctx.options.functions?.map((func) => ({
        kind: 'BLOCK',
        type: funcName(func),
      })),
    });
  }

  // Inject Blockly.
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox,
    renderer: 'thrasos',
    zoom: {
      maxScale: 1,
      minScale: 0.8,
      scaleSpeed: 1.2,
      pinch: true,
    },
    trashcan: false,
    theme: theme,
  });
  Blockly.serialization.workspaces.load(loadOnce || startBlocks, workspace);
  workspace.zoomToFit();

  return workspace;
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
          VAR: {id: 'Count'},
        },
        inputs: {
          VALUE: {
            block: {
              type: 'math_number',
              fields: {NUM: 1},
            },
          },
        },
        next: {
          block: {
            type: 'controls_whileUntil',
            fields: {MODE: 'WHILE'},
            inputs: {
              BOOL: {
                block: {
                  type: 'logic_compare',
                  fields: {OP: 'LTE'},
                  inputs: {
                    A: {
                      block: {
                        type: 'variables_get',
                        fields: {
                          VAR: {id: 'Count'},
                        },
                      },
                    },
                    B: {
                      block: {
                        type: 'math_number',
                        fields: {NUM: 3},
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
                        fields: {TEXT: 'Hello World!'},
                      },
                    },
                  },
                  next: {
                    block: {
                      type: 'variables_set',
                      fields: {
                        VAR: {id: 'Count'},
                      },
                      inputs: {
                        VALUE: {
                          block: {
                            type: 'math_arithmetic',
                            fields: {OP: 'ADD'},
                            inputs: {
                              A: {
                                block: {
                                  type: 'variables_get',
                                  fields: {
                                    VAR: {id: 'Count'},
                                  },
                                },
                              },
                              B: {
                                block: {
                                  type: 'math_number',
                                  fields: {NUM: 1},
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
  variables: [
    {
      name: 'Count',
      id: 'Count',
    },
  ],
};