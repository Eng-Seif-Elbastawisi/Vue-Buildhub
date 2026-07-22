import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Allow @use 'abstracts' without relative paths in any .scss / <style lang="scss">
        loadPaths: [fileURLToPath(new URL('./src/styles', import.meta.url))],
      },
    },
  },
  server: {
    watch: {
      // Avoid Linux inotify exhaustion in large, editor-heavy workspaces.
      usePolling: true,
      interval: 500,
    },
  },
});
