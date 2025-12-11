type TypographyOptions = {
  fontFamily?: string;
};

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

export const typography: TypographyOptions = {
  fontFamily: fontStack,
};

