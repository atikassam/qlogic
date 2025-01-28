import 'ses';
import * as Comlink from 'comlink';
import { JSDOM } from 'jsdom';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { setupBlocklyWithOptions } from './blockly';
import { QLogicExecutionOptionsSerializable } from './lib/QLogicEnvironment';
// use happy-dom
// import { Window } from 'happy-dom';
// import * as domino from 'domino';
// import * as linkedom from 'linkedom';

// var window = domino.createWindow('<h1>Hello world</h1>', 'http://example.com');

// const window = new Window();

// const { window } = linkedom.parseHTML('<!DOCTYPE html><html><body></body></html>');

// const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
// (global as any).window = window;
// (global as any).document = window.document;
// (global as any).XMLHttpRequest = window.XMLHttpRequest;
// (global as any).DOMParser = window.DOMParser;

// importScripts('https://unpkg.com/snabbdom/build/snabbdom.js');
// importScripts('https://unpkg.com/blockly/blockly.min.js');

// Mock basic DOM environment using Snabbdom

import * as snabbdom from 'snabbdom';
// const snabbdom = snabbdom.init([]); // Initialize Snabbdom with no modules

console.warn('Snabbdom initialized, global.document is now available');
// Virtual DOM root node
const vdomRoot = snabbdom.h('div#app', []);

// Create a minimal document-like environment
const DOMMock = {
  createElement: (tagName: any) => snabbdom.h(tagName, {}),
  createElementNS: (namespace: any, tagName: any) => snabbdom.h(tagName, { ns: namespace }),
  createTextNode: (text: any) => snabbdom.h('text', text),
  appendChild: () => {}, // Snabbdom handles appending virtually
  removeChild: () => {}, // Snabbdom handles virtual removal
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelector: () => vdomRoot,
  querySelectorAll: () => [vdomRoot],
};

// Mock global environment
(global as any).document = DOMMock;
(global as any).window = { document: DOMMock, addEventListener: () => {}, removeEventListener: () => {} };

// const DOMMock = {
//   createElement: () => ({}),
//   createElementNS: () => ({}),
//   createTextNode: () => ({}),
//   getElementById: () => null,
//   querySelector: () => null,
//   querySelectorAll: () => [],
//   appendChild: () => null,
//   removeChild: () => null,
//   addEventListener: () => null,
//   removeEventListener: () => null,
// };
//
// (global as any).document = DOMMock;
// (global as any).window = { document: DOMMock, addEventListener: () => null, removeEventListener: () => null };
// (global as any).navigator = { userAgent: 'mock' }; // Optional mock navigator

// // Create a JSDOM environment
// const { window } = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
//
// // Declare global types for TypeScript
// (global as any).window = window;
// (global as any).document = window.document;
// (global as any).XMLHttpRequest = window.XMLHttpRequest;
// (global as any).DOMParser = window.DOMParser;

console.warn('JSDOM initialized, global.window and global.document are now available');
console.warn('It is only for internal use, will be moved to worker in the future');

// lockdown({ legacyRegeneratorRuntimeTaming: 'safe' });

Comlink.expose({
  evaluate: async (logic: any, options: QLogicExecutionOptionsSerializable, names: any, functions: any, data: any) => {
    try {
      console.log('Logic:', logic);
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
      const result = await compartment.evaluate(code);

      return { success: true, result };
    } catch (error) {
      console.log('Error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  evaluate1: async (code: string, names: any, functions: any, data: any) => {
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
