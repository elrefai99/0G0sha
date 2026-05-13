import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.1,
      warn: true,
    }),
    presetTypography(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      ink: {
        950: '#0b0f19',
        900: '#111827',
        800: '#1f2937',
        700: '#374151',
      },
      signal: {
        500: '#16a34a',
        600: '#15803d',
      },
      ember: {
        400: '#f59e0b',
        500: '#d97706',
      },
    },
  },
  shortcuts: {
    'panel': 'bg-white border border-gray-200 rounded-lg shadow-sm',
    'panel-dark': 'bg-ink-900 border border-ink-800 rounded-lg shadow-sm',
    'field': 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-ink-900 focus:ring-3 focus:ring-gray-200',
    'field-dark': 'w-full rounded-md border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-white outline-none transition focus:border-white focus:ring-3 focus:ring-white/10',
    'btn': 'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-600 transition disabled:cursor-not-allowed disabled:opacity-55',
    'btn-primary': 'btn bg-ink-900 text-white hover:bg-ink-800',
    'btn-soft': 'btn bg-gray-100 text-ink-900 hover:bg-gray-200',
    'btn-ghost': 'btn text-gray-700 hover:bg-gray-100',
    'tab': 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-600 text-gray-600 transition hover:bg-gray-100 hover:text-ink-900',
    'tab-active': 'bg-ink-900 text-white hover:bg-ink-900 hover:text-white',
    'metric': 'rounded-lg border border-gray-200 bg-white p-4',
  },
})
