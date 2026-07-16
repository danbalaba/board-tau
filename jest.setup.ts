import '@testing-library/jest-dom';

const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('not wrapped in act') ||
    msg.includes('React does not recognize the') ||
    msg.includes('Failed to fetch recommendations') ||
    msg.includes('Upload error') ||
    msg.includes('non-boolean attribute `layout`') ||
    msg.includes('non-boolean attribute `fill`') ||
    msg.includes('non-boolean attribute `priority`') ||
    msg.includes('non-boolean attribute `unoptimized`') ||
    msg.includes('passed to the src attribute') ||
    msg.includes('non-boolean attribute `initial`') ||
    msg.includes('non-boolean attribute `drag`') ||
    msg.includes('non-boolean attribute `animate`') ||
    msg.includes('non-boolean attribute `exit`')
  ) {
    return; // Ignore expected test noise
  }
  originalConsoleError(...args);
};

console.log = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('SearchManager component rendered') ||
    msg.includes('Digital Spoofing Detected')
  ) {
    return; // Ignore expected test noise
  }
  originalConsoleLog(...args);
};

// Global mocks for testing
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}
