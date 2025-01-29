import { DOMParser } from 'xmldom';

function createVirtualWindow() {
  const document = new DOMParser().parseFromString('<!DOCTYPE html><html><body></body></html>', 'text/html');

  const virtualWindow = {
    DOMParser,
    document,
    navigator: {
      userAgent: 'WebWorker',
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    // Add any other `window`-level methods if needed
  };

  return virtualWindow;
}

export const win = typeof window !== 'undefined' ? window : createVirtualWindow();
export default win;
