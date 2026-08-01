import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mem-cash/validation': 'node_modules/@mem-cash/validation/dist/index.js',
    },
  },
  optimizeDeps: {
    exclude: ['@mem-cash/validation'],
  },
});