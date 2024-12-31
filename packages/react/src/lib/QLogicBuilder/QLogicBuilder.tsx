import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  BoxProps,
  Button,
  Card,
  CardProps,
  Divider,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { init } from '../../blockly';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { useQLogicBuilder } from './QLogicBuilderProvider';

export type QLogicBuilderProps = {
  bgcolor?: BoxProps['bgcolor'];
  ContainerProps?: CardProps & {};
  showCode?: boolean;
  height?: number;
};

export function QLogicBuilder(props: QLogicBuilderProps) {
  const { ContainerProps, showCode, height = 400, bgcolor } = props;
  const ctx = useQLogicBuilder();

  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [workspace, setWorkspace] = useState<Blockly.Workspace | null>(null);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'logic' | 'code'>('logic');

  const regenerate = useCallback((_e: any) => {
    if (!workspace || (Blockly.getMainWorkspace() as any).isDragging()) {
      return; // Don't update code mid-drag.
    }

    const code = javascriptGenerator.workspaceToCode(
      Blockly.getMainWorkspace()
    );

    ctx.setState(Blockly.serialization.workspaces.save(workspace));
    setCode(code);
  }, [ctx, workspace]);

  const runCode = useCallback(() => {
    // createWorker();
  }, []);

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
      <Stack direction={'column'} width={'100%'} spacing={2}>
        {showCode && (
          <Box>
            <Stack direction={'row'} alignItems={'center'}>
              <Tabs onChange={(_e, v) => setActiveTab(v)} value={activeTab}>
                <Tab label="Logic" value={'logic'} />
                <Tab label="Code" value={'code'} />
              </Tabs>
              <Box flex={1} />
              <Button
                variant={'contained'}
                size={'small'}
                disableElevation
                onClick={runCode}
              >
                Run
              </Button>
            </Stack>
            <Divider />
          </Box>
        )}
        <Box
          display={
            !showCode ? undefined : activeTab === 'logic' ? undefined : 'none'
          }
          id="blocklyDiv"
          className="main"
          ref={blocklyDivRef}
          height={height}
        />
        {activeTab === 'code' && showCode && (
          <Card
            component={Box}
            bgcolor={(t) => t.palette.action.hover}
            p={1}
            boxSizing={'border-box'}
            width={'100%'}
            height={height}
            variant={'outlined'}
          >
            <SyntaxHighlighter
              language="javascript"
              style={a11yLight}
              customStyle={{
                padding: 8,
                margin: 0,
              }}
            >
              {code}
            </SyntaxHighlighter>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

export default QLogicBuilder;
