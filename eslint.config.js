import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'generated/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: [
      'src/routes/**/*.js',
      'src/ui/*.js',
      'src/components/RouteExperienceShell.jsx',
      'src/auricrux_engine.js',
      'router.jsx',
    ],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
    },
  },
  {
    files: ['router.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: [
      'api/**/*.js',
      'revenue-webhook/**/*.js',
      'auricrux_engine.js',
      'src/auricrux_engine.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        module: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$|^context$|^err$' }],
    },
  },
  {
    files: ['src/bootstrap.jsx'],
    rules: {
      'no-useless-escape': 'off',
    },
  },
  {
    files: [
      'src/App.jsx',
      'src/components/PublicTopNav.jsx',
      'src/hooks/useBidWorkspace.js',
      'src/hooks/useCustomerSession.js',
      'src/hooks/useProjectWorkspace.js',
      'src/hooks/useWorkspaceState.js',
      'src/pages/website/Login.jsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
