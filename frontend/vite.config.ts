import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const currentDir = fileURLToPath(new URL('.', import.meta.url));
  const rootDir = path.resolve(currentDir, '..');
  const env = loadEnv(mode, rootDir, '');

  return {
    envDir: rootDir,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:5173',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: (env.DISABLE_HMR || process.env.DISABLE_HMR) !== 'true',
      watch: (env.DISABLE_HMR || process.env.DISABLE_HMR) === 'true' ? null : {},
    },
  };
});
