import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
      },
    },
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        },
      },
    },
    // Source maps for production debugging (disabled for smaller builds)
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Environment variable prefix
  envPrefix: 'VITE_',
  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
    host: true, // Allow external connections
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
  },
})
