import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { realpathSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Keep each local review's optimizer separate from shared installed packages.
  cacheDir: '.vite-local-cache',
  optimizeDeps: { entries: ['src/journey/HouseJourney.tsx'] },
  // Local worktrees can share installed packages. Allow only this project's
  // root and the resolved dependency tree so packaged fonts remain available.
  // Workspace synchronization emits changes for unedited files. Freeze this
  // review server's watcher; intentional edits need a controlled restart.
  server: { watch: null, fs: { allow: [process.cwd(), realpathSync('node_modules')] } },
})
