import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
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
    ],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
    },
  },
])
