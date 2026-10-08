import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173 },
  // o Three.js sozinho passa de 500 kB; ele já é carregado separado (lazy) do resto do site
  build: { chunkSizeWarningLimit: 1000 }
});
