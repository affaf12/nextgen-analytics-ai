import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves a project site at https://<user>.github.io/<repo>/,
  // so the build needs to know it isn't living at the domain root.
  base: process.env.GITHUB_ACTIONS ? '/nextgen-analytics-ai/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
