import 'ses';
import * as Comlink from 'comlink';
// lockdown({ legacyRegeneratorRuntimeTaming: 'safe' });

Comlink.expose({
  evaluate: (code: string, names: any, functions: any, data: any) => {
    console.log('Evaluating:', data);
    try {
      console.log('Evaluating:', code, names, functions);
      // (options as any).alert('Loaded');
      console.log(typeof harden);
      // lockdown();
      console.log(typeof harden);
      // Create a secure Compartment
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
      const result = compartment.evaluate(code);

      console.log('Result:', result);
      return { success: true };
    } catch (error) {
      console.log('Error:', error);
      // Send back the error if execution fails
      return { success: false, error: (error as Error).message };
    }
  },
});
