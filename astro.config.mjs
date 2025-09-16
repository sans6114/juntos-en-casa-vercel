import icon from 'astro-icon';
// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',
  adapter: netlify(),
  integrations: [icon({
    iconDir: "./src/icons",
    include: {
        // Incluir el conjunto de iconos MDI
        mdi: ['*'], // Esto incluye todos los 
      }
  }), react()]
});