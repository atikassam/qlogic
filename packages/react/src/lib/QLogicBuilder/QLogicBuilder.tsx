import { useCallback, useEffect, useRef } from 'react';
import { Box, BoxProps, CardProps } from '@mui/material';
import { init } from '../../blockly';
import * as Blockly from 'blockly';
import { useQLogicBuilder } from './QLogicBuilderProvider';
import _ from 'lodash';

export type QLogicBuilderProps = {
  sounds?: boolean;
  bgcolor?: BoxProps['bgcolor'];
  ContainerProps?: CardProps & {};
  height?: number;
};

export function QLogicBuilder(props: QLogicBuilderProps) {
  const { ContainerProps, height = 400, bgcolor, sounds } = props;
  const ctx = useQLogicBuilder();
  const { workspace, setWorkspace } = ctx;

  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const regenerate = useCallback(_.throttle((_e: any) => {
    if (!workspace || (Blockly.getMainWorkspace() as any).isDragging()) {
      return; // Don't update code mid-drag.
    }

    ctx.setState(Blockly.serialization.workspaces.save(workspace));
  }, 500), [ctx, workspace]);

  useEffect(() => {
    if (isInitialized.current || !ctx.environment) return; // Skip if already initialized

    if (blocklyDivRef.current) {
      const { workspace, dispose } = init({ env: ctx.environment, sounds, initialState: ctx.initialState });
      setWorkspace(workspace);
      isInitialized.current = true; // Mark as initialized

      return () => {
        isInitialized.current = false;
        dispose();
      };
    }

    return;
  }, [blocklyDivRef.current]);

  useEffect(() => {
    if (!workspace) return;
    workspace.addChangeListener(regenerate);

    return () => {
      if (!workspace) return;
      workspace.removeChangeListener(regenerate);
    };
  }, [workspace]);

  return (
    <Box
      sx={{
        '--bg': bgcolor || ((t: any) => t.palette.background.default) as any,
      }}
      {...ContainerProps}
      className="app-container"
    >
        <Box
          width={'100%'}
          id="blocklyDiv"
          className="main"
          ref={blocklyDivRef}
          height={height}
        />
    </Box>
  );
}

export default QLogicBuilder;
