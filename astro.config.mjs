import icon from 'astro-icon';
// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',
  adapter: netlify(),
  integrations: [icon({
    include: {
        // Incluir el conjunto de iconos MDI
        mdi: ['*'], // Esto incluye todos los iconos MDI
        // O puedes ser más específico:
        // mdi: ['menu', 'close']
      }
  })]
});