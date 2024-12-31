import * as Comlink from 'comlink';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import _ from 'lodash';

export type QLogicEnvironmentFunc = {
  name: string;
  args?: {
    name: string;
    type: string
  }[];
  func: (...args: any[]) => any;
}

export type QLogicExecutionOptions = {
  data?: any;
  functions?: QLogicEnvironmentFunc[];
};


const createWorker = () => {
  const worker = new Worker('../execute-unsafe-code.worker.ts');
  const link = Comlink.wrap<any>(worker);

  return { worker, link };
};

export class QLogicEnvironment {
  static create(options?: QLogicExecutionOptions) {
    const { worker, link } =  createWorker();
    return new QLogicEnvironment(worker, link, options);
  }

  private constructor(private worker: Worker, private link:  Comlink.Remote<any>, public readonly options?: QLogicExecutionOptions) {}

  async execute(logic: any, _options: QLogicExecutionOptions): Promise<any> {
    const options = _.merge({}, this.options, _options);
    if (!logic) {
      console.error('No logic provided');
      return;
    }

    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(logic, workspace);
    const code = javascriptGenerator.workspaceToCode(workspace);

    console.log('Executing:', code);
    const functions = {
      ...Object.fromEntries(
        options?.functions?.map(({ name, func }) => [name, func]) || []
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