import React, { FC, useMemo } from 'react';
import { QLogicEnvironment } from '../QLogicEnvironment';

export type QLogicBuilderHelper = {
  initialState?: any;
  state: any | null;
  setState: (state: any) => void;
  environment: QLogicEnvironment;
};

const QLogicBuilderCtx = React.createContext<QLogicBuilderHelper | undefined>(
  undefined
);

export const QLogicBuilderProvider: FC<{
  children: (helper: QLogicBuilderHelper) => React.ReactNode;
  environment: QLogicEnvironment;
  initialState?: any;
}> = (props) => {
  const { children, environment, initialState } = props;
  const [state, setState] = React.useState<any | null>(null);

  const helper = useMemo(
    () => ({ state, setState, environment, initialState } as QLogicBuilderHelper),
    [state, environment, initialState]
  );
  return (
    <QLogicBuilderCtx.Provider value={helper}>
      {children(helper)}
    </QLogicBuilderCtx.Provider>
  );
};

export const useQLogicBuilder = () => {
  const ctx = React.useContext(QLogicBuilderCtx);
  if (!ctx)
    throw new Error(
      'useQLogicBuilder must be used within a QLogicBuilderProvider'
    );

  return ctx;
};

export default QLogicBuilderProvider;
