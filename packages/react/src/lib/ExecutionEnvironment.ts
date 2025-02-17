import { isNode } from './node.env';
import * as Comlink from 'comlink';
import Worker from 'web-worker';
import { WLink } from './types';

export class ExecutionEnvironment {
  static createExecutionWorker = () => {
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
    const link = Comlink.wrap<WLink>(worker);

    return { worker, link };
  };

  static new() {
    const { worker, link } = ExecutionEnvironment.createExecutionWorker();
    return new ExecutionEnvironment(worker, link);
  }

  protected constructor(
    protected worker: Worker,
    protected link: Comlink.Remote<WLink>
  ) {}

  async exec(
    code: string,
    functions: { [name: string]: (...args: any[]) => any }
  ): Promise<any> {
    if (!code) {
      console.error('No code provided');
      return;
    }

    const names = Object.keys(functions);
    return this.link.execute(code, names, Comlink.proxy(functions));
  }

  terminate() {
    this.worker.terminate();
  }
}
