import SparkMD5 from 'spark-md5';
import * as Comlink from 'comlink';

import DefineLazyData from '../blockly/blocks/custom/define-lazy-data';
import DefineFunc from '../blockly/blocks/custom/define-func';
import DefineQfunc from '../blockly/blocks/custom/define-qfunc';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import {
  QLogicEnvironmentNamespace,
  QLogicExecutionCtx,
  QLogicExecutionOptions,
  QLogicExecutionOptionsSerializable,
  WLink
} from './types';

export class QLogicEnvironment<T = any> extends ExecutionEnvironment {
  static toNamespace(name: string): QLogicEnvironmentNamespace {
    return `qlogic_${SparkMD5.hash(name) as string}`;
  }

  static create<T>(options: QLogicExecutionOptions<T>) {
    const { worker, link } = ExecutionEnvironment.createExecutionWorker();
    if (!options.namespace) throw new Error('namespace is required');
    else if (!options.namespace.startsWith('qlogic_'))
      throw new Error('namespace should start with qlogic_');
    else if (!/^[a-z0-9_]+$/i.test(options.namespace))
      throw new Error('namespace should be alphanumeric');

    return new QLogicEnvironment<T>(worker, link, options);
  }

  private constructor(
    protected override worker: Worker,
    protected override link: Comlink.Remote<WLink>,
    public readonly options: QLogicExecutionOptions<T>
  ) {
    super(worker, link);
  }

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
}
