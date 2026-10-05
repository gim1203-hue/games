import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const base = process.env.GITHUB_PAGES === 'true' ? '/games/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
