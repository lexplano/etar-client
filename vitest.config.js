import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.js'],
      reporter: ['text'],
      thresholds: {
        statements: 96,
        branches: 98,
        functions: 96,
        lines: 96,
      },
    },
  },
});
