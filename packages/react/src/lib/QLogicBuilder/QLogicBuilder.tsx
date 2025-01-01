import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, BoxProps, CardProps } from '@mui/material';
import { init } from '../../blockly';
import * as Blockly from 'blockly';
import { useQLogicBuilder } from './QLogicBuilderProvider';

export type QLogicBuilderProps = {
  bgcolor?: BoxProps['bgcolor'];
  ContainerProps?: CardProps & {};
  height?: number;
};

export function QLogicBuilder(props: QLogicBuilderProps) {
  const { ContainerProps, height = 400, bgcolor } = props;
  const ctx = useQLogicBuilder();

  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [workspace, setWorkspace] = useState<Blockly.Workspace | null>(null);

  const regenerate = useCallback((_e: any) => {
    if (!workspace || (Blockly.getMainWorkspace() as any).isDragging()) {
      return; // Don't update code mid-drag.
    }

    console.log(workspace.options)
    ctx.setState(Blockly.serialization.workspaces.save(workspace));
  }, [ctx, workspace]);

  useEffect(() => {
    if (isInitialized.current) return; // Skip if already initialized

    if (blocklyDivRef.current) {
      setWorkspace(init(ctx.environment));
      isInitialized.current = true; // Mark as initialized
    }
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
