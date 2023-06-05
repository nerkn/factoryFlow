import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({

	server: {
    host:'0.0.0.0',
		proxy: {
		  //'/api': 'http://panelim.siparisci.com:8880',
		  '/api': 'http://flowmobilBackDev:3000',
		}},
  plugins: [react()],
})
