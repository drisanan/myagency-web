import '@testing-library/jest-dom';
// Polyfill TextEncoder/Decoder for libraries that expect them (e.g., MUI X)
// @ts-ignore
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
if (!global.TextEncoder) {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}
// @ts-ignore
if (!global.TextDecoder) {
  // @ts-ignore
  global.TextDecoder = TextDecoder as any;
}


