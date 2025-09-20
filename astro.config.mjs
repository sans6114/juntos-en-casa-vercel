import icon from 'astro-icon';
// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  output: 'server',

  integrations: [icon({
    iconDir: "./src/icons",
    include: {
        // Incluir el conjunto de iconos MDI
        mdi: ['*'], // Esto incluye todos los 
      }
  }), react()],

  adapter: vercel()
});