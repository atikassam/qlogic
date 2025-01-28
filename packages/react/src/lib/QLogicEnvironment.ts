import { isNode } from './node.env';

import * as Comlink from 'comlink';
import Worker from 'web-worker';

export type QLogicExecutionCtx<T = any> = {
  data: T;
};

export type OptionArgType = {
  label?: string;
  name: string;
  type: 'options';
  options: { label: string; value: any }[];
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

export type QLogicEnvironmentLazyDataSerializable = Omit<QLogicEnvironmentLazyDataOption, 'isList'> & {
  name: string;
  next: QLogicEnvironmentLazyDataOption[];
};

export type QLogicEnvironmentLazyData<T = any> = QLogicEnvironmentLazyDataSerializable & {
  func: (
    option: QLogicExecutionCtx<T>,
    path: ({ id: string } | { index: number })[]
  ) => any;
};

export type QLogicEnvironmentQFuncSerializable = {
  name: string;
  conditional?: boolean;
  returns?: ArgType[];
};

export type QLogicEnvironmentQFunc<T = any> = QLogicEnvironmentQFuncSerializable & {
  func: (option: QLogicExecutionCtx<T>, ...args: any[]) => any;
};

export type QLogicEnvironmentFuncSerializable = {
  name: string;
  args?: ArgType[];
  returnType?: string;
};

export type QLogicEnvironmentFunc<T = any> = QLogicEnvironmentFuncSerializable & {
  func: (option: QLogicExecutionCtx<T>, ...args: any[]) => any;
};

export type QLogicExecutionOptionsSerializable = {
  allowedRootBlocks?: ({ qfunc: string } | { function: string })[];
  qfuns?: QLogicEnvironmentQFuncSerializable[];
  functions?: QLogicEnvironmentFuncSerializable[];
  lazyData?: QLogicEnvironmentLazyDataSerializable[];
};

export type QLogicExecutionOptions<T = any> = {
  allowedRootBlocks?: ({ qfunc: string } | { function: string })[];
  qfuns?: QLogicEnvironmentQFunc<T>[];
  functions?: QLogicEnvironmentFunc<T>[];
  lazyData?: QLogicEnvironmentLazyData<T>[];
};

export type WLink = {
  evaluate(logic: any, options: QLogicExecutionOptionsSerializable, names: string[], functions: any, data: any): Promise<any>;
}

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
  const link = Comlink.wrap<WLink>(worker);

  return { worker, link };
};

export class QLogicEnvironment<T = any> {
  static create<T>(options: QLogicExecutionOptions<T>) {
    const { worker, link } = createWorker();
    return new QLogicEnvironment<T>(worker, link, options);
  }

  private constructor(
    private worker: Worker,
    private link: Comlink.Remote<WLink>,
    public readonly options: QLogicExecutionOptions<T>
  ) {}

  async execute(logic: any, _options: QLogicExecutionCtx<T>): Promise<any> {
    if (!logic) {
      console.error('No logic provided');
      return;
    }

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
      logic,
      QLogicEnvironment.toSerializable(this.options),
      names,
      Comlink.proxy(functions),
      _options.data
    );
  }

  static toSerializable(options: QLogicExecutionOptions): QLogicExecutionOptionsSerializable {
    return JSON.parse(JSON.stringify(options))
  }

  terminate() {
    this.worker.terminate();
  }
}
