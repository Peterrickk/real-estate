import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  resolve: {
    alias: {
      '@mem-cash/validation': 'node_modules/@mem-cash/validation/dist/index.js',
    },
  },
  optimizeDeps: {
    exclude: ['@mem-cash/validation'],
  },
>>>>>>> d39668adf4dfda8c80381b2e7fbb009921268f31
});
