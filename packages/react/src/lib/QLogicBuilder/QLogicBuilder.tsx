import { useEffect, useRef } from 'react';
import { Box, Stack, StackProps } from '@mui/material';
import { initiateBlockLy } from '../../blockly';

export type QLogicBuilderProps = {
  ContainerProps?: StackProps & {};
};

export function QLogicBuilder(props: QLogicBuilderProps) {
  const { ContainerProps } = props;
  const generatedCodeElmRef = useRef<HTMLPreElement>(null);
  const outputElmRef = useRef<HTMLDivElement>(null);
  const blocklyDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !blocklyDivRef.current ||
      !outputElmRef.current ||
      !generatedCodeElmRef.current
    )
      return;

    initiateBlockLy(
      generatedCodeElmRef.current,
      outputElmRef.current,
      blocklyDivRef.current
    );
  }, []);

  return (
    <Stack sx={{ width: '100%', height: '400px' }} {...ContainerProps} direction={'row'}>
      <Box id="outputPane">
        <pre id="generatedCode">
          <code ref={generatedCodeElmRef}></code>
        </pre>
        <Box id="output" ref={outputElmRef}></Box>
      </Box>
      <Box id="blocklyDiv" ref={blocklyDivRef}></Box>
    </Stack>
  );
}

export default QLogicBuilder;
