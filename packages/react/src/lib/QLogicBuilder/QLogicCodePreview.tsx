import { useMemo } from 'react';
import { javascriptGenerator } from 'blockly/javascript';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useQLogicBuilder } from './QLogicBuilderProvider';
import * as Blockly from 'blockly';
import _ from 'lodash';

export function QLogicCodePreview() {
  const { state } = useQLogicBuilder();
  const code = useMemo(() => {
    if (!state) return '';

    const workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(_.cloneDeep(state), workspace);

    return javascriptGenerator.workspaceToCode(workspace);
  }, [state]);

  return (
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
  );
}