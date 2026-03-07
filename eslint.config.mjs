import js from '@eslint/js';
import globals from 'globals';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: 'writable',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    ignores: ['node_modules/', '.next/', '**/*.d.ts'],
  },
];
