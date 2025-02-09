import React, { FC, useCallback, useMemo, useState } from 'react';
import { QLogicEnvironment } from '../QLogicEnvironment';
import { javascriptGenerator } from 'blockly/javascript';
import * as Blockly from 'blockly';

export type QLogicBuilderHelper = {
  initialState?: any;
  state: any | null;
  setState: (state: any) => void;
  environment: QLogicEnvironment;
  toJS: () => string;

  workspace: Blockly.Workspace | null;
  setWorkspace: (workspace: Blockly.Workspace) => void;
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
  const [workspace, setWorkspace] = useState<Blockly.Workspace | null>(null);

  const toJS = useCallback(() => {
    if (!state || !workspace) return '';
    return javascriptGenerator.workspaceToCode(workspace);
  }, [state, workspace]);


  const helper = useMemo(
    () => ({ state, setState, environment, initialState, toJS, workspace, setWorkspace } as QLogicBuilderHelper),
    [state, toJS, environment, workspace, initialState]
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
