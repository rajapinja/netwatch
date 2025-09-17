import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Unocss from 'unocss/vite'
import { presetUno } from 'unocss'
import presetTypography from '@unocss/preset-typography'

export default defineConfig({
  plugins: [react(), Unocss({ presets: [presetUno(), presetTypography()] })],
  define: {
    global: "window", // Fix for sockjs-client
  },
})
