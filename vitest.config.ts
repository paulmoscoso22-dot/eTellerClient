import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Force devextreme packages to be bundled (transform as CJS) rather
    // than loaded as raw ESM to avoid "Directory import not supported" errors.
    server: {
      deps: {
        inline: ['devextreme', 'devextreme-angular'],
      },
    },
  },
});
