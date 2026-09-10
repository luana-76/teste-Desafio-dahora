import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Expõe o servidor na rede local (0.0.0.0), não só em localhost —
    // necessário para outros computadores acessarem o frontend.
    host: true,
  },
});
