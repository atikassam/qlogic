
import * as Blockly from 'blockly';
import { toolboxJson } from './toolbox';
import './index.css';
import { theme } from './theme';
import { QLogicEnvironment, QLogicExecutionOptionsSerializable } from '../lib/QLogicEnvironment';
import IsTruthyValue from './blocks/custom/is-truthy-value';
import * as javascript from 'blockly/javascript';
import DefineFunc from './blocks/custom/define-func';
import DefineQfunc from './blocks/custom/define-qfunc';
import DefineLazyData from './blocks/custom/define-lazy-data';
import { StrictConnectionCheckerPluginInfo } from './plugins/TypeCheck';

(function setupCommonBlocks() {
  Blockly.common.defineBlocks({
    [IsTruthyValue.name]: IsTruthyValue.Block,
  });
  javascript.javascriptGenerator.forBlock[IsTruthyValue.name] =
    IsTruthyValue.Generator as any;
})();

export function initBlocklyWithOptions(options: QLogicExecutionOptionsSerializable) {
  options.functions?.forEach((item) => DefineFunc.register(options, item));
  options.qfuns?.forEach((item) => DefineQfunc.register(options, item));
  options.lazyData?.forEach((item) => DefineLazyData.register(options, item));
}

export function deinitBlocklyWithOptions(options: QLogicExecutionOptionsSerializable) {
  options.functions?.forEach((item) => DefineFunc.unregister(options, item));
  options.qfuns?.forEach((item) => DefineQfunc.unregister(options, item));
  options.lazyData?.forEach((item) => DefineLazyData.unregister(options, item));
}

/**
 * Initialize the page once everything is loaded.
 */
export function init(opts: {
  sounds?: boolean;
  env: QLogicEnvironment;
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
    initBlocklyWithOptions(env.options);

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
          type: DefineLazyData.name(opts.env.options, func),
        })) || []),
        ...(env.options.functions?.map((func) => ({
          kind: 'BLOCK',
          type: DefineFunc.name(opts.env.options, func),
        })) || []),
        ...(env.options.qfuns?.map((func) => ({
          kind: 'BLOCK',
          type: DefineQfunc.name(opts.env.options, func),
        })) || []),
      ],
    });
  }

  // Inject Blockly.
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox,
    plugins: {
      ...StrictConnectionCheckerPluginInfo
    },
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

  Blockly.Events.disable();
  Blockly.serialization.workspaces.load(initialState ?? startBlocks, workspace);
  Blockly.Events.enable();

  workspace.zoomToFit();

  const allowedRootBlocks = opts.env?.options?.allowedRootBlocks?.map((b) => {
    if ('qfunc' in b) return DefineQfunc.name(opts.env.options, { name: b.qfunc });
    return DefineFunc.name(opts.env.options, { name: b.function });
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

    disableBlocks(block, disabled);
  });

  return {
    workspace,
    dispose() {
      workspace.dispose();
      deinitBlocklyWithOptions(env.options);
    }
  };
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
    blocks: [],
  },
  variables: [],
};
