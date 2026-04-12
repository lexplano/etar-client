import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js'],
      reporter: ['text'],
      thresholds: {
        statements: 95,
        branches: 96,
        functions: 96,
        lines: 95,
      },
    },
  },
});
