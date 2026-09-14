import '@testing-library/jest-dom';
import React from 'react';

const originalConsoleError = console.error;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (
    msg.includes('not wrapped in act') ||
    msg.includes('React does not recognize the') ||
    msg.includes('Failed to fetch recommendations') ||
    msg.includes('Upload error') ||
    msg.includes('SEARCH_ENGINE_FAILURE') ||
    msg.includes('SEARCH_COUNT_FAILURE') ||
    msg.includes('non-boolean attribute `layout`') ||
    msg.includes('non-boolean attribute `fill`') ||
    msg.includes('non-boolean attribute `priority`') ||
    msg.includes('non-boolean attribute `unoptimized`') ||
    msg.includes('passed to the src attribute') ||
    msg.includes('download the whole page again over the network') ||
    msg.includes('non-boolean attribute `initial`') ||
    msg.includes('non-boolean attribute `drag`') ||
    msg.includes('non-boolean attribute `animate`') ||
    msg.includes('non-boolean attribute `exit`') ||
    msg.includes('HTMLCanvasElement.prototype.getContext') ||
    msg.includes('Not implemented: HTMLCanvasElement')
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

  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
  });

  if (typeof Element !== 'undefined') {
    if (!Element.prototype.scrollTo) Element.prototype.scrollTo = jest.fn();
    if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = jest.fn();
  }

  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
      setTransform: jest.fn(),
      drawFocusIfNeeded: jest.fn(),
      canvas: {},
    })) as any;
  }

  class MockIntersectionObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
}

if (typeof global.Request === 'undefined') {
  global.Request = class MockRequest {} as any;
}

// Global Redis mock for testing to prevent ESM uncrypto module parsing issues
jest.mock('@/lib/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    flushdb: jest.fn().mockResolvedValue('OK'),
    keys: jest.fn().mockResolvedValue([]),
    exists: jest.fn().mockResolvedValue(0),
  },
  cache: {
    generateKey: jest.fn((prefix: string, params: any) => `${prefix}:${JSON.stringify(params || {})}`),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    delPattern: jest.fn().mockResolvedValue(true),
    exists: jest.fn().mockResolvedValue(false),
    flush: jest.fn().mockResolvedValue(true),
  },
}));

// Global jsPDF & contract PDF generator mock to prevent ESM parsing errors in tests
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    line: jest.fn(),
    setFillColor: jest.fn(),
    roundedRect: jest.fn(),
    rect: jest.fn(),
    save: jest.fn(),
    output: jest.fn().mockReturnValue(new Blob()),
    lastAutoTable: { finalY: 100 }
  }));
});

jest.mock('@/utils/contractPdfGenerator', () => ({
  generateDigitalLeasePDF: jest.fn().mockResolvedValue(new Uint8Array()),
  generateContractPdf: jest.fn().mockResolvedValue(new Uint8Array()),
}));

// Global Taxonomy & Query Hooks Mocks for Component Tests
jest.mock('@/hooks/useColleges', () => ({
  useColleges: jest.fn(() => ({
    data: [
      { id: '1', code: 'TAU', name: 'Tarlac Agricultural University', originLat: 15.635, originLng: 120.415 }
    ],
    isLoading: false,
    error: null
  }))
}));

jest.mock('@/hooks/usePropertyTypes', () => ({
  usePropertyTypes: jest.fn(() => ({
    data: [
      { id: '1', name: 'Boarding House', icon: 'Home' },
      { id: '2', name: 'Apartment', icon: 'Building' }
    ],
    propertyTypes: [
      { id: '1', name: 'Boarding House', icon: 'Home' },
      { id: '2', name: 'Apartment', icon: 'Building' }
    ],
    isLoading: false,
    error: null
  }))
}));

jest.mock('@/hooks/useAttributes', () => ({
  useAttributes: jest.fn(() => ({
    data: [
      { id: '1', name: 'WiFi', type: 'AMENITY', subGroupKey: 'AMENITY' },
      { id: '2', name: 'No Curfew', type: 'RULE', subGroupKey: 'CURFEW' },
      { id: '3', name: 'CCTV Monitoring', type: 'FEATURE', subGroupKey: 'SECURITY' }
    ],
    isLoading: false,
    error: null
  }))
}));

jest.mock('@/hooks/useDynamicAttributes', () => ({
  useDynamicAttributes: jest.fn(() => ({
    attributes: [
      { id: '1', name: 'WiFi', type: 'AMENITY', subGroupKey: 'AMENITY' },
      { id: '2', name: 'No Curfew', type: 'RULE', subGroupKey: 'CURFEW' },
      { id: '3', name: 'CCTV Monitoring', type: 'FEATURE', subGroupKey: 'SECURITY' }
    ],
    resolveAmenityName: (id: string) => id,
  })),
}));

jest.mock('@/components/common/HelpTooltip', () => {
  return function MockHelpTooltip({ children, text }: any) {
    return React.createElement('div', { 'data-testid': 'mock-help-tooltip' }, children || text);
  };
});

// Global Search Step Cache mock to bypass 400ms shimmer timeouts in search step tests
jest.mock('@/lib/searchStepCache', () => ({
  isStepCached: jest.fn().mockReturnValue(true),
  markStepCached: jest.fn(),
  clearStepCache: jest.fn(),
}));

// Mock dynamic Map import globally for instant synchronous rendering
jest.mock('next/dynamic', () => () => {
  return function MockDynamicComponent() {
    return React.createElement('div', { 'data-testid': 'mock-dynamic-component' }, 'Mock Dynamic Component');
  };
});

// Global Axios mock to prevent HTTP timeouts in test environments
jest.mock('axios', () => {
  return {
    get: jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/admin/attributes') || url.includes('/api/admin/sub-groups')) {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url.includes('/api/property-types')) {
        return Promise.resolve({
          data: [
            { id: '1', name: 'Boarding House', icon: 'Home' },
            { id: '2', name: 'Apartment', icon: 'Building' },
          ],
        });
      }
      if (url.includes('/api/room-types')) {
        return Promise.resolve({
          data: [
            { id: '1', name: 'Solo Room', icon: 'User' },
            { id: '2', name: 'Bedspace', icon: 'Users' },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    }),
    post: jest.fn().mockResolvedValue({ data: { success: true } }),
    put: jest.fn().mockResolvedValue({ data: { success: true } }),
    patch: jest.fn().mockResolvedValue({ data: { success: true } }),
    delete: jest.fn().mockResolvedValue({ data: { success: true } }),
    create: jest.fn().mockReturnThis(),
  };
});

// Global taxonomyCache mock to eliminate step attribute fetching delay
jest.mock('@/lib/taxonomyCache', () => ({
  fetchTaxonomyData: jest.fn().mockResolvedValue({
    attributes: [
      { id: '1', name: 'WiFi', subGroupId: 'sg-1', subGroupKey: 'AMENITY', type: 'AMENITY' },
      { id: '2', name: 'No Curfew', subGroupId: 'sg-2', subGroupKey: 'CURFEW', type: 'RULE' },
      { id: '3', name: 'CCTV Monitoring', subGroupId: 'sg-3', subGroupKey: 'SECURITY', type: 'FEATURE' },
    ],
    subGroups: [
      { id: 'sg-1', name: 'General', key: 'AMENITY', sortOrder: 1 },
      { id: 'sg-2', name: 'Curfew', key: 'CURFEW', sortOrder: 2 },
      { id: 'sg-3', name: 'Security', key: 'SECURITY', sortOrder: 3 },
    ],
    timestamp: Date.now(),
  }),
  getTaxonomyDataSync: jest.fn().mockReturnValue({
    attributes: [
      { id: '1', name: 'WiFi', subGroupId: 'sg-1', subGroupKey: 'AMENITY', type: 'AMENITY' },
      { id: '2', name: 'No Curfew', subGroupId: 'sg-2', subGroupKey: 'CURFEW', type: 'RULE' },
      { id: '3', name: 'CCTV Monitoring', subGroupId: 'sg-3', subGroupKey: 'SECURITY', type: 'FEATURE' },
    ],
    subGroups: [
      { id: 'sg-1', name: 'General', key: 'AMENITY', sortOrder: 1 },
      { id: 'sg-2', name: 'Curfew', key: 'CURFEW', sortOrder: 2 },
      { id: 'sg-3', name: 'Security', key: 'SECURITY', sortOrder: 3 },
    ],
    timestamp: Date.now(),
  }),
  clearTaxonomyCache: jest.fn(),
}));

// Global Framer Motion mock to prevent background animation timer handles in Jest JSDOM
jest.mock('framer-motion', () => {
  const React = require('react');
  const createMotionComponent = (tagName: string) => {
    return React.forwardRef((props: any, ref: any) => {
      const {
        initial,
        animate,
        exit,
        transition,
        layout,
        whileHover,
        whileTap,
        whileFocus,
        whileDrag,
        whileInView,
        drag,
        dragControls,
        dragConstraints,
        dragElastic,
        onAnimationStart,
        onAnimationComplete,
        onUpdate,
        ...rest
      } = props;
      return React.createElement(tagName, { ref, ...rest });
    });
  };

  const validTags = new Set([
    'div', 'span', 'button', 'a', 'p', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'section', 'article', 'nav', 'header', 'footer', 'main',
    'aside', 'form', 'input', 'label', 'textarea', 'select', 'option', 'svg', 'path'
  ]);

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          const tagName = validTags.has(prop) ? prop : 'div';
          return createMotionComponent(tagName);
        },
      }
    ),
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
    LayoutGroup: ({ children }: any) => React.createElement(React.Fragment, null, children),
    AnimateSharedLayout: ({ children }: any) => React.createElement(React.Fragment, null, children),
    useDragControls: jest.fn(() => ({ start: jest.fn() })),
    useAnimation: jest.fn(() => ({
      start: jest.fn().mockResolvedValue(true),
      stop: jest.fn(),
      set: jest.fn(),
    })),
    useMotionValue: jest.fn((val: any) => ({
      get: () => val,
      set: jest.fn(),
      onChange: jest.fn(),
    })),
    useMotionTemplate: (strings: any, ...values: any[]) => {
      if (Array.isArray(strings)) {
        return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
      }
      return '';
    },
    useTransform: jest.fn((val: any) => ({
      get: () => val,
      onChange: jest.fn(),
    })),
    useSpring: jest.fn((val: any) => ({
      get: () => val,
      onChange: jest.fn(),
    })),
    useInView: jest.fn(() => true),
    useScroll: jest.fn(() => ({ scrollY: { get: () => 0 }, scrollYProgress: { get: () => 0 } })),
    useVelocity: jest.fn(() => ({ get: () => 0 })),
    useReducedMotion: jest.fn(() => false),
  };
});

// Mock custom React Query hooks for colleges, attributes, and property types
jest.mock('@/hooks/useColleges', () => ({
  useColleges: jest.fn(() => ({
    data: [
      { id: '1', code: 'COS', name: 'College of Science', latitude: 15.4, longitude: 120.6 },
      { id: '2', code: 'CETA', name: 'College of Engineering', latitude: 15.5, longitude: 120.7 },
    ],
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/hooks/useAttributes', () => ({
  useAttributes: jest.fn(() => ({
    data: [
      { id: 'attr-1', name: 'Aircon', category: 'AMENITY', scope: 'ROOM', isFilterable: true },
      { id: 'attr-2', name: 'WiFi', category: 'AMENITY', scope: 'PROPERTY', isFilterable: true },
    ],
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/hooks/usePropertyTypes', () => ({
  usePropertyTypes: jest.fn(() => ({
    data: [
      { id: '1', name: 'Boarding House', icon: 'Home', description: 'Bedspace & solo rooms' },
      { id: '2', name: 'Apartment', icon: 'Building', description: 'Whole unit flat rate' },
    ],
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/lib/searchStepCache', () => ({
  isStepCached: jest.fn(() => true),
  markStepCached: jest.fn(),
  clearStepCache: jest.fn(),
}));

// Mock dynamic imports & Leaflet Map component globally to prevent Leaflet unpkg network hangs
jest.mock('next/dynamic', () => (func: any) => {
  const React = require('react');
  return function DummyDynamic(props: any) {
    return React.createElement('div', { 'data-testid': 'mock-dynamic-component' }, props?.children);
  };
});

jest.mock('@/components/common/Map', () => {
  const React = require('react');
  return function MockMap(props: any) {
    return React.createElement('div', { 'data-testid': 'mock-map' }, 'Mock Map Component');
  };
});

// Mock KerbyMascot globally to prevent 22ms typewriter setInterval timers in all tests
jest.mock('@/components/modals/search-modal/KerbyMascot', () => ({
  KerbyMascot: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'kerby-mascot-mock' });
  },
}));

// Mock taxonomyCache globally to prevent async axios admin taxonomy hangs
jest.mock('@/lib/taxonomyCache', () => ({
  fetchTaxonomyData: jest.fn(() => Promise.resolve({ attributes: [], subGroups: [] })),
  getTaxonomyDataSync: jest.fn(() => ({ attributes: [], subGroups: [] })),
  clearTaxonomyCache: jest.fn(),
}));





