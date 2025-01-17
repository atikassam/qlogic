import 'ses';
import * as Comlink from 'comlink';
// lockdown({ legacyRegeneratorRuntimeTaming: 'safe' });

Comlink.expose({
  evaluate: async (code: string, names: any, functions: any, data: any) => {
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
      const result = await compartment.evaluate(code);

      return { success: true, result };
    } catch (error) {
      console.log('Error:', error);
      return { success: false, error: (error as Error).message };
    }
  },
});
