import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    server: {
      host: true,
      strictPort: true,
      allowedHosts: [
        "trial-project-atanas-stage.eu.aldryn.io",
        "localhost",
        "127.0.0.1"
      ],
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8000/api'),
    },
  };
});
