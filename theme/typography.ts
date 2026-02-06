export const fontStack = [
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Helvetica',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
].join(',');

const headingFont = '"Bebas Neue", sans-serif';

export const typography = {
  fontFamily: fontStack,
  h1: { fontFamily: headingFont, fontSize: '4rem', letterSpacing: '0.02em', lineHeight: 1, fontWeight: 400 },
  h2: { fontFamily: headingFont, fontSize: '3rem', letterSpacing: '0.02em', lineHeight: 1.05, fontWeight: 400 },
  h3: { fontFamily: headingFont, fontSize: '2.5rem', lineHeight: 1, letterSpacing: '0.01em', fontWeight: 400 },
  h4: { fontFamily: headingFont, fontSize: '2rem', lineHeight: 1.1, letterSpacing: '0.01em', fontWeight: 400 },
  h5: { fontFamily: headingFont, fontSize: '1.5rem', lineHeight: 1.15, fontWeight: 400 },
  h6: { fontFamily: fontStack, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  subtitle1: { fontSize: '1rem', fontWeight: 600 },
  subtitle2: { fontSize: '0.875rem', fontWeight: 600 },
  body1: { fontSize: '0.9375rem' },
  body2: { fontSize: '0.8125rem' },
  caption: { fontSize: '0.75rem', letterSpacing: '0.02em' },
};
