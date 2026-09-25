import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Plugin to ensure build output exists both in frontend/dist AND root dist
function mirrorDistPlugin() {
  return {
    name: 'mirror-dist',
    closeBundle() {
      try {
        const srcDir = path.resolve(__dirname, 'dist')
        const destDir = path.resolve(__dirname, '../dist')
        if (fs.existsSync(srcDir)) {
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true })
          }
          fs.cpSync(srcDir, destDir, { recursive: true })
          console.log('✓ Successfully mirrored build output to root dist/')
        }
      } catch (err) {
        console.warn('Mirror dist warning:', err.message)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mirrorDistPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
