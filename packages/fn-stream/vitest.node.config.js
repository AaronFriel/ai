/* v8 ignore start */
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/*.ui.test.ts', '**/*.ui.test.tsx', 'node_modules/**'],
    typecheck: {
      enabled: true,
    },
  },
});
