import 'ses';

// Lockdown the environment
lockdown();

// Define the lookup table for exposed functions
const lookupTable = {
  mathUtils: {
    add: (a: number, b: number) => a + b,
    multiply: (a: number, b: number) => a * b,
  },
  console: {
    log: (...args: any[]) => self.postMessage({ log: args.join(' ') }),
  },
};

// Handle messages from the main thread
self.onmessage = (event: MessageEvent) => {
  const { script } = event.data;
  try {
    // Create a secure compartment with the lookup table as globals
    const compartment = new Compartment(lookupTable);
    const result = compartment.evaluate(script);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};
