import { defineConfig, presetUno, presetIcons, presetTypography } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetTypography(), presetIcons()],
  theme: {
    colors: {
      brand: '#5d5debff',      // Indigo
      accent: '#f1a979ff',     // Orange
      surface: '#eefcf5ff',    // Section background
    }
  }
})