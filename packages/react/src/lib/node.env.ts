import { JSDOM } from 'jsdom';

export const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

declare global {
  var isNode: boolean;
}

if (isNode) {
  // Create a JSDOM environment
  const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);

  // Declare global types for TypeScript
  (global as any).window = window;
  (global as any).document = window.document;
  (global as any).XMLHttpRequest = window.XMLHttpRequest;
  (global as any).DOMParser = window.DOMParser;
}
