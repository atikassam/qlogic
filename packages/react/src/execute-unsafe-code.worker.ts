import 'ses';

import('./polyfill').then(async () => {
  const Comlink = await import('comlink');
  const { javascriptGenerator } = await import('blockly/javascript');
  const { initBlocklyWithOptions }  = await import('./blockly');
  const Blockly = await import('blockly');

  const exports = {
    execute: async (code: string, names: any, functions: any) => {
      try {
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
    evaluate: async (logic: any, options: any, names: any, functions: any, data: any) => {
      try {
        initBlocklyWithOptions(options);
        const workspace = new Blockly.Workspace();
        Blockly.serialization.workspaces.load(logic, workspace);
        const code = javascriptGenerator.workspaceToCode(workspace);

        return await exports.execute(code, names, functions);
      } catch (error) {
        console.log('Error:', error);
        return { success: false, error: (error as Error).message };
      }
    },
  }
  Comlink.expose(exports);
})
