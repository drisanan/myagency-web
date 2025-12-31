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

// Mock react-quill-new for Jest tests (dynamically loaded component)
jest.mock('react-quill-new', () => {
  const React = require('react');
  const MockQuill = React.forwardRef(function MockQuill(
    { value, onChange, placeholder, ...props }: any,
    ref: any
  ) {
    return React.createElement('div', {
      'data-testid': 'mock-quill-editor',
      ref,
      ...props,
    }, [
      React.createElement('textarea', {
        key: 'editor',
        'data-testid': 'quill-textarea',
        value: value || '',
        onChange: (e: any) => onChange?.(e.target.value),
        placeholder,
        style: { width: '100%', minHeight: '200px' },
      }),
    ]);
  });
  return MockQuill;
});


