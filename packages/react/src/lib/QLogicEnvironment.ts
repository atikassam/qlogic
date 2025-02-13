import { isNode } from './node.env';
import SparkMD5 from 'spark-md5';
import * as Comlink from 'comlink';
import Worker from 'web-worker';

import DefineLazyData from '../blockly/blocks/custom/define-lazy-data';
import DefineFunc from '../blockly/blocks/custom/define-func';
import DefineQfunc from '../blockly/blocks/custom/define-qfunc';

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
      type: string | string[] | 'any';
    };

export type QLogicEnvironmentLazyDataOption = {
  /**
   * this should be unique across all options including nested options
   */
  id: string;
  key: string;
  label: string;
  isList?: boolean;
  next?: QLogicEnvironmentLazyDataOption[];
};

export type QLogicEnvironmentLazyDataSerializable = Omit<
  QLogicEnvironmentLazyDataOption,
  'isList'
> & {
  name: string;
  next: QLogicEnvironmentLazyDataOption[];
};

export type QLogicEnvironmentLazyData<T = any> =
  QLogicEnvironmentLazyDataSerializable & {
    func: (
      option: QLogicExecutionCtx<T>,
      path: ({ id: string } | { index: number })[]
    ) => any;
  };

export type QLogicEnvironmentQFuncSerializable = {
  name: string;
  conditional?: boolean;
  returns?: ArgType[];
  allowedPrevious?: ({ qfunc: string } | { function: string })[];
  allowedNext?: ({ qfunc: string } | { function: string })[];
};

export type QLogicEnvironmentQFunc<T = any> =
  QLogicEnvironmentQFuncSerializable & {
    func: (option: QLogicExecutionCtx<T>, ...args: any[]) => any;
  };

export type QLogicEnvironmentFuncSerializable = {
  name: string;
  args?: ArgType[];
  returnType?: string;
};

export type QLogicEnvironmentFunc<T = any> =
  QLogicEnvironmentFuncSerializable & {
    func: (option: QLogicExecutionCtx<T>, ...args: any[]) => any;
  };

export type QLogicEnvironmentNamespace = `qlogic_${string}`;

export type QLogicExecutionOptionsSerializable = {
  namespace: QLogicEnvironmentNamespace;
  maxRootBlocks?: number;
  allowedRootBlocks?: ({ qfunc: string } | { function: string })[];
  qfuns?: QLogicEnvironmentQFuncSerializable[];
  functions?: QLogicEnvironmentFuncSerializable[];
  lazyData?: QLogicEnvironmentLazyDataSerializable[];
};

export type QLogicExecutionOptions<T = any> = Omit<QLogicExecutionOptionsSerializable, keyof { qfuns: any, functions: any, lazyData: any }> & {
  qfuns?: QLogicEnvironmentQFunc<T>[];
  functions?: QLogicEnvironmentFunc<T>[];
  lazyData?: QLogicEnvironmentLazyData<T>[];
};

export type WLink = {
  evaluate(
    logic: any,
    options: QLogicExecutionOptionsSerializable,
    names: string[],
    functions: any,
    data: any
  ): Promise<any>;
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
  const link = Comlink.wrap<WLink>(worker);

  return { worker, link };
};

export class QLogicEnvironment<T = any> {

  static toNamespace(name: string): QLogicEnvironmentNamespace {
    return `qlogic_${SparkMD5.hash(name) as string}`;
  }

  static create<T>(options: QLogicExecutionOptions<T>) {
    const { worker, link } = createWorker();
    if (!options.namespace) throw new Error('namespace is required');
    else if (!options.namespace.startsWith('qlogic_')) throw new Error('namespace should start with qlogic_');
    else if (!/^[a-z0-9_]+$/i.test(options.namespace)) throw new Error('namespace should be alphanumeric');

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
          DefineLazyData.name(this.options, { name }),
          (...args: any[]) => (func as any)(_options, ...args),
        ]) || []),
        ...(this.options?.functions?.map(({ name, func }) => [
          DefineFunc.name(this.options, { name }),
          (...args: any[]) => func(_options, ...args),
        ]) || []),
        ...(this.options?.qfuns?.map(({ name, func }) => [
          DefineQfunc.name(this.options, { name }),
          (...args: any[]) => func(_options, ...args),
        ]) || []),
      ]),
    };

    const names = Object.keys(functions);
    return this.link.evaluate(
      logic,
      QLogicEnvironment.toSerializableQLogicExecutionOptions(this.options),
      names,
      Comlink.proxy(functions),
      _options.data
    );
  }

  private static toSerializableQLogicExecutionOptions(
    options: QLogicExecutionOptions
  ): QLogicExecutionOptionsSerializable {
    return JSON.parse(JSON.stringify(options));
  }

  terminate() {
    this.worker.terminate();
  }
}
