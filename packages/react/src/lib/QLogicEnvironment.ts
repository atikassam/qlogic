import { isNode } from './node.env';

import * as Comlink from 'comlink';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import _ from 'lodash';
import { defineFunctionBlock } from '../blockly/blocks/define-function-blocks';
import Worker from 'web-worker';
import { defineQFunctionBlock } from '../blockly/blocks/define-qfunction-blocks';
import DefineLazyData from '../blockly/blocks/define-lazy-data';

export type QLogicExecutionCtx<T = any> = {
  data: T;
};

export type OptionArgType = {
  label?: string;
  name: string;
  type: 'options';
  options: { label: string; value: any }[] | (() => { label: string; value: any }[]);
};

export type ArgType =
  | OptionArgType
  | {
      label?: string;
      name: string;
      type: string;
    };

export type QLogicEnvironmentLazyDataOption = {
  /**
   * this should be unique across all options including nested options
   */
  id: string,
  key: string,
  label: string,
  isList?: boolean,
  next?: QLogicEnvironmentLazyDataOption[]
}

export type QLogicEnvironmentLazyData<T = any> = QLogicEnvironmentLazyDataOption & {
  name: string;
  next: QLogicEnvironmentLazyDataOption[];
  func: (
    option: QLogicExecutionCtx<T>,
    path: ({ id: string } | { index: number })[]
  ) => any;
};

export type QLogicEnvironmentQFunc<T = any> = {
  name: string;
  conditional?: boolean;
  returns?: ArgType[];
  func: (option: QLogicExecutionCtx<T>, ...args: any[]) => any;
};

export type QLogicEnvironmentFunc<T = any> = {
  name: string;
  args?: ArgType[];
  returnType?: string;
  func: (option: QLogicExecutionCtx<T>, ...args: any[]) => any;
};

export type QLogicExecutionOptions<T = any> = {
  allowedRootBlocks?: ({ qfunc: string } | { function: string })[];
  qfuns?: QLogicEnvironmentQFunc<T>[];
  functions?: QLogicEnvironmentFunc<T>[];
  lazyData?: QLogicEnvironmentLazyData<T>[];
};

const createWorker = () => {
  let worker;
  if (isNode) {
    worker = new Worker(__dirname + '/execute-unsafe-code.worker.cjs.js');
  } else {
    worker = new Worker(
      new URL('./execute-unsafe-code.worker.esm.js', import.meta.url),
      { type: 'module' }
    );
  }
  // const worker = new Worker('./execute-unsafe-code.worker.esm.js');
  const link = Comlink.wrap<any>(worker);

  return { worker, link };
};

export class QLogicEnvironment<T = any> {
  static create<T>(options?: QLogicExecutionOptions<T>) {
    const { worker, link } = createWorker();
    return new QLogicEnvironment<T>(worker, link, options);
  }

  static PrepareBlockly(options: QLogicExecutionOptions) {
    options.functions?.forEach(defineFunctionBlock);
    options.qfuns?.forEach(defineQFunctionBlock);
    options.lazyData?.forEach(DefineLazyData.register);
  }

  private constructor(
    private worker: Worker,
    private link: Comlink.Remote<any>,
    public readonly options?: QLogicExecutionOptions<T>
  ) {}

  async execute(logic: any, _options: QLogicExecutionCtx<T>): Promise<any> {
    if (!logic) {
      console.error('No logic provided');
      return;
    }

    if (this.options) QLogicEnvironment.PrepareBlockly(this.options);
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(logic, workspace);
    const code = javascriptGenerator.workspaceToCode(workspace);

    const functions = {
      ...Object.fromEntries([
        ...(this.options?.lazyData?.map(({ name, func }) => [
          name,
          (...args: any[]) => (func as any)(_options, ...args),
        ]) || []),
        ...(this.options?.functions?.map(({ name, func }) => [
          name,
          (...args: any[]) => func(_options, ...args),
        ]) || []),
        ...(this.options?.qfuns?.map(({ name, func }) => [
          name,
          (...args: any[]) => func(_options, ...args),
        ]) || []),
      ]),
    };

    const names = Object.keys(functions);

    return this.link.evaluate(
      `(async function main() { ${code} \n\treturn 'OK'; })()`,
      names,
      Comlink.proxy(functions),
      _options.data
    );
  }

  terminate() {
    this.worker.terminate();
  }
}
