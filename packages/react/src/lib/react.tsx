import { useEffect, useRef } from 'react';
import { initiateBlockLy } from '../blockly';
import { Box } from '@mui/material';

export function React() {
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
    <Box id="pageContainer">
      <div id="outputPane">
        <pre id="generatedCode" ref={generatedCodeElmRef}>
          <code></code>
        </pre>
        <div id="output" ref={outputElmRef}></div>
      </div>
      <div id="blocklyDiv" ref={blocklyDivRef}></div>
    </Box>
  );
}

export default React;