import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        hmr: true,
        host: '0.0.0.0', // Add this line to allow connections from all network interfaces
        watch: {
            usePolling: true // Add this for better file watching when using VPN
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false
            }
        }
    },
});