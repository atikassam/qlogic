import * as Blockly from 'blockly';
import { toolboxJson } from './toolbox';
import './index.css';
import { theme } from './theme';
import { defineFunctionBlocks } from './blocks/define-function-blocks';
import { QLogicExecutionOptions } from '../lib/QLogicEnvironment';

/**
 * Initialize the page once everything is loaded.
 */
export function init(ctx?: QLogicExecutionOptions) {
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

  if (ctx) defineFunctionBlocks(ctx, toolbox);

  // Inject Blockly.
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox,
    renderer: 'thrasos',
    zoom: {
      maxScale: 1.8,
      minScale: 0.6,
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
 * Change the (human) language.  Reloads the page.
 */
export function languageChange() {
  // Store the blocks in sessionStorage for the duration of the reload.
  const text = JSON.stringify(
    Blockly.serialization.workspaces.save(Blockly.getMainWorkspace()),
  );
  try {
    window.sessionStorage.setItem('loadOnceBlocks', text);
  } catch (e) {
    // Storage can be flakey.
    console.log(e);
  }

  const newLang = (document.getElementById('languageDropdown') as HTMLSelectElement).value;
  window.location.search = '?hl=' + encodeURIComponent(newLang);
}


/**
 * Generate JavaScript from the blocks, then execute it using JS-Interpreter.
 */
export function execute() {
  const initFunc = function (interpreter: any, globalObject: any) {
    const alertWrapper = function alert(text: string) {
      return window.alert(arguments.length ? text : '');
    };
    interpreter.setProperty(
      globalObject,
      'alert',
      interpreter.createNativeFunction(alertWrapper),
    );

    const promptWrapper = function prompt(text: string, defaultValue: string) {
      return window.prompt(
        arguments.length > 0 ? text : '',
        arguments.length > 1 ? defaultValue : '',
      );
    };
    interpreter.setProperty(
      globalObject,
      'prompt',
      interpreter.createNativeFunction(promptWrapper),
    );
  };

  const code = (window as any).javascript.javascriptGenerator.workspaceToCode(
    Blockly.getMainWorkspace(),
  );
  const myInterpreter = new (window as any).Interpreter(code, initFunc);
  let stepsAllowed = 10000;
  while (myInterpreter.step() && stepsAllowed) {
    stepsAllowed--;
  }
  if (!stepsAllowed) {
    throw EvalError('Infinite loop.');
  }
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