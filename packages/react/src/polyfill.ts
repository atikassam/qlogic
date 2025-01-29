import { DOMParser } from 'xmldom';

const document = new DOMParser().parseFromString('<!DOCTYPE html><html><body></body></html>', 'text/html');

(global as any).window = { document, DOMParser };
(global as any).document = document;
(global as any).DOMParser = DOMParser;
