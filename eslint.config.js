import { globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

// defineConfigWithVueTs replaces the old defineConfig + vueTsEslintConfig() pattern.
// It wires up @typescript-eslint/parser for .ts files and <script lang="ts">
// blocks inside .vue files automatically.
export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    // 'ts' included so ESLint processes oracle TypeScript files:
    // types/oracle.ts, Deck.ts, currentDeck.ts, spreads.ts
    files: ['**/*.{js,mjs,jsx,ts,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  // Registers @typescript-eslint/parser for .ts files and for
  // <script lang="ts"> blocks inside .vue files.
  // Package already installed: @vue/eslint-config-typescript
  vueTsConfigs.recommended,
  skipFormatting,
)
