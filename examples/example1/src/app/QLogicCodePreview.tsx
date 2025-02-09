import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useQLogicBuilder } from '@qlogic/react';

export function QLogicCodePreview() {
  const { toJS } = useQLogicBuilder();

  return (
    <SyntaxHighlighter
      language="javascript"
      style={a11yLight}
      customStyle={{
        padding: 8,
        margin: 0,
      }}
    >
      {toJS()}
    </SyntaxHighlighter>
  );
}