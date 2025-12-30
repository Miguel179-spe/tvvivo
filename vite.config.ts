import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    host: true
  },
  preview: {
    port: 8080,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});