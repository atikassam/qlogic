import { JSDOM } from 'jsdom';

// Create a JSDOM environment
const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);

// Declare global types for TypeScript
(global as any).window = window;
(global as any).document = window.document;
(global as any).XMLHttpRequest = window.XMLHttpRequest;
(global as any).DOMParser = window.DOMParser;

console.warn('JSDOM initialized, global.window and global.document are now available');
console.warn('It is only for internal use, will be moved to worker in the future');

