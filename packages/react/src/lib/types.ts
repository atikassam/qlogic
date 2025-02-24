export type QLogicExecutionCtx<T = any> = {
  data: T;
};
export type OptionArgType = {
  label?: string;
  key: string;
  name: string;
  type: 'options';
  options: { label: string; value: any }[];
};
export type ArgType =
  | OptionArgType
  | {
      label?: string;
      name: string;
      key: string;
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
  label: string;
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
  label: string;
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
export type QLogicExecutionOptions<T = any> = Omit<
  QLogicExecutionOptionsSerializable,
  keyof { qfuns: any; functions: any; lazyData: any }
> & {
  qfuns?: QLogicEnvironmentQFunc<T>[];
  functions?: QLogicEnvironmentFunc<T>[];
  lazyData?: QLogicEnvironmentLazyData<T>[];
};
export type WLink = {
  execute(code: string, names: string[], functions: any): Promise<any>;
  evaluate(
    logic: any,
    options: QLogicExecutionOptionsSerializable,
    names: string[],
    functions: any,
    data: any
  ): Promise<any>;
};

export interface QDPropertyDef {
  title: string;
  description?: string;
  type: string;
  isArray?: boolean;
  items?: {
    [key: string]: QDPropertyDef;
  }
}