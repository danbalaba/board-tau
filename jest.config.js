const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFiles: ['<rootDir>/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^jspdf$': 'jspdf/dist/jspdf.umd.min.js',
    '^jose$': '<rootDir>/node_modules/jose/dist/node/cjs/index.js',
    '^jose/(.*)$': '<rootDir>/node_modules/jose/dist/node/cjs/$1',
    '^.*[\\\\/]node_modules[\\\\/]jose[\\\\/]dist[\\\\/]browser[\\\\/](.*)$': '<rootDir>/node_modules/jose/dist/node/cjs/$1',
    '^@panva/hkdf$': '<rootDir>/node_modules/@panva/hkdf/dist/node/cjs/index.js',
    '^.*[\\\\/]node_modules[\\\\/]@panva[\\\\/]hkdf[\\\\/]dist[\\\\/]web[\\\\/](.*)$': '<rootDir>/node_modules/@panva/hkdf/dist/node/cjs/$1',
    '^preact-render-to-string$': '<rootDir>/node_modules/preact-render-to-string/dist/commonjs.js',
    '^.*[\\\\/]node_modules[\\\\/]preact-render-to-string[\\\\/].*$': '<rootDir>/node_modules/preact-render-to-string/dist/commonjs.js',
    '^preact$': '<rootDir>/node_modules/preact/dist/preact.js',
  },
  collectCoverage: false,
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  reporters: [
    "default",
    ["jest-html-reporter", {
      "pageTitle": "BoardTAU Test Report",
      "outputPath": `test-reports/test-report-${new Date().toISOString().replace(/:/g, '-')}.html`,
      "includeFailureMsg": false
    }]
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json'
    }
  },
  testMatch: [
    '**/?(*.)+(spec|test).[tj]s?(x)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/tests/__template__/',
    // Integration tests require a live MongoDB — run these locally only
    'services/listing/__tests__/search.integration.test.ts'
  ]
}

module.exports = createJestConfig(customJestConfig)
