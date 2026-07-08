import { defineConfig } from 'vite';

// Nothing secret here — the REST base URL is a public endpoint and lives in src/config.ts.
export default defineConfig({
  server: { open: true, port: 5173 },
  build: { target: 'es2020' },
});
