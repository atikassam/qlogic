import { isNode } from './node.env';

import * as Comlink from 'comlink';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import _ from 'lodash';
import { defineFunctionBlock } from '../blockly/blocks/define-function-blocks';
import Worker from 'web-worker';
import { defineQFunctionBlock } from '../blockly/blocks/define-qfunction-blocks';

export type QLogicExecutionCtx<T = any> = {
  data?: T;
};

export type OptionArgType = {
  label?: string;
  name: string;
  type: 'options';
  options: { label: string; value: string }[];
};

export type ArgType =
  | OptionArgType
  | {
      label?: string;
      name: string;
      type: string;
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

export type QLogicExecutionOptions<T = any> = QLogicExecutionCtx<T> & {
  allowedRootBlocks?: ({ qfunc: string } | { function: string })[];
  qfuns?: QLogicEnvironmentQFunc<T>[];
  functions?: QLogicEnvironmentFunc<T>[];
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
  }

  private constructor(
    private worker: Worker,
    private link: Comlink.Remote<any>,
    public readonly options?: QLogicExecutionOptions<T>
  ) {}

  async execute(logic: any, _options: QLogicExecutionOptions<T>): Promise<any> {
    const options = _.merge({}, this.options, _options);
    if (!logic) {
      console.error('No logic provided');
      return;
    }

    QLogicEnvironment.PrepareBlockly(options);
    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(logic, workspace);
    const code = javascriptGenerator.workspaceToCode(workspace);

    const functions = {
      ...Object.fromEntries(
        (
          options?.functions?.map(({ name, func }) => [
            name,
            (...args: any[]) => func(_options, ...args),
          ]) || []
        ).concat(
          options?.qfuns?.map(({ name, func }) => [
            name,
            (...args: any[]) => func(_options, ...args),
          ]) || []
        )
      ),
    };

    const names = Object.keys(functions);

    return this.link.evaluate(
      `(async function main() { ${code} \n\treturn 'OK'; })()`,
      names,
      Comlink.proxy(functions),
      options?.data
    );
  }

  terminate() {
    this.worker.terminate();
  }
}
