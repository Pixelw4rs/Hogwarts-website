import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API = process.env.ARDET_API ?? 'http://localhost:8080';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // The motion layer, live-data stores and pure helpers stay in data/js during the move, so every
      // animation runs from the same code as the current site.
      '@legacy': fileURLToPath(new URL('../data/js', import.meta.url)),
      '@legacy-css': fileURLToPath(new URL('../data/css', import.meta.url)),
      '@assets': fileURLToPath(new URL('../data', import.meta.url)),
    },
  },
  server: {
    host: true, // listen on the LAN too, so the mockup opens from other devices
    fs: { allow: ['..'] },
    proxy: { '/api': API, '/uploads': API },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
