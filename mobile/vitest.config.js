import { defineConfig } from 'vitest/config';

// Solo la lógica pura y el cliente HTTP llevan tests automáticos
// (constitución, Principio I para mobile). No necesitan React Native.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
  },
});
