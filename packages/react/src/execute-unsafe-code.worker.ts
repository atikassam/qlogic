import 'ses';

import('./polyfill').then(async () => {
  const Comlink = await import('comlink');
  const { javascriptGenerator } = await import('blockly/javascript');
  const { setupBlocklyWithOptions }  = await import('./blockly');
  const Blockly = await import('blockly');

  Comlink.expose({
    evaluate: async (logic: any, options: any, names: any, functions: any, data: any) => {
      try {
        setupBlocklyWithOptions(options);
        const workspace = new Blockly.Workspace();
        Blockly.serialization.workspaces.load(logic, workspace);
        const code = javascriptGenerator.workspaceToCode(workspace);

        const compartment = new Compartment({
          globals: {
            ...Object.fromEntries(
              names.map((name: string) => [
                name,
                functions[name],
              ])
            ),
          },
          __options__: true,
        });

        // Execute the provided code in the secure environment
        const result = await compartment.evaluate(`(async function main() { ${code} \n\treturn 'OK'; })()`);
        return { success: true, result };
      } catch (error) {
        console.log('Error:', error);
        return { success: false, error: (error as Error).message };
      }
    },
  });
})
