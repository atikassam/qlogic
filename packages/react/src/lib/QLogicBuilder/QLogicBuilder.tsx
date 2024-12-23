import { ChangeEvent, useEffect, useRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import { execute, init, languageChange } from '../../blockly';

export type QLogicBuilderProps = {
  ContainerProps?: BoxProps & {};
  noBorder?: boolean;
  background?: string;
};

export function QLogicBuilder(props: QLogicBuilderProps) {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false); // To ensure the initialization happens only once

  useEffect(() => {
    if (isInitialized.current) return; // Skip if already initialized

    if (blocklyDivRef.current) {
      init();
      isInitialized.current = true; // Mark as initialized
    }
  }, []);

  function regenerate(event: ChangeEvent<HTMLSelectElement>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <body>
      <div className="app-container">
        <Box id="blocklyDiv" className="main" ref={blocklyDivRef} height={400}/>
        <div id="outputDiv" className="main">
          <select id="generateDropdown" onChange={regenerate}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="php">PHP</option>
            <option value="lua">Lua</option>
            <option value="dart">Dart</option>
          </select>
          <br className="next-line" />
          <select id="languageDropdown" onChange={languageChange}></select>
          <pre id="codeHolder" className="prettyprint" dir="ltr"></pre>
        </div>
        <div id="playButton" className="play-button" onClick={execute}>
          <span className="material-icons" aria-hidden="true">
            play_circle_outlined
          </span>
          Run
        </div>
      </div>
    </body>
  );
}

export default QLogicBuilder;
