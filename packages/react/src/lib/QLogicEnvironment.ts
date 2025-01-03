import * as Comlink from 'comlink';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import _ from 'lodash';
import { defineFunctionBlock } from '../blockly/blocks/define-function-blocks';

export type QLogicExecutionCtx = {
  data?: any;
};


export type QLogicEnvironmentFunc = {
  name: string;
  args?: {
    name: string;
    type: string
  }[];
  returnType?: string;
  func: (option: QLogicExecutionCtx, ...args: any[]) => any;
}

export type QLogicExecutionOptions = QLogicExecutionCtx & {
  functions?: QLogicEnvironmentFunc[];
};


const createWorker = () => {
  const worker = new Worker(new URL('./execute-unsafe-code.worker.cjs.js', import.meta.url));
  const link = Comlink.wrap<any>(worker);

  return { worker, link };
};

export class QLogicEnvironment {
  static create(options?: QLogicExecutionOptions) {
    const { worker, link } =  createWorker();
    return new QLogicEnvironment(worker, link, options);
  }

  static PrepareBlockly(options: QLogicExecutionOptions) {
    options.functions?.forEach(defineFunctionBlock);
  }

  private constructor(private worker: Worker, private link:  Comlink.Remote<any>, public readonly options?: QLogicExecutionOptions) {}

  async execute(logic: any, _options: QLogicExecutionOptions): Promise<any> {
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
        options?.functions?.map(({ name, func }) => [
          name,
          (...args: any[]) => func(_options, ...args)
        ]) || []
      ),
    };

    const names = Object.keys(functions);

    return this.link.evaluate(
      `(async function main() { ${code} })()`,
      names,
      Comlink.proxy(functions),
      options?.data
    );
  }

  terminate() {
    this.worker.terminate()
  }
}