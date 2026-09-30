import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { realpathSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Local worktrees can share installed packages. Allow only this project's
  // root and the resolved dependency tree so packaged fonts remain available.
  server: { fs: { allow: [process.cwd(), realpathSync('node_modules')] } },
})
