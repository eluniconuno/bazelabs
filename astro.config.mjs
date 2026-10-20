// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';
import keystatic from '@keystatic/astro';

// URL pública do site. Na Netlify, a variável URL é preenchida automaticamente.
const site = process.env.SITE_URL || process.env.URL || 'https://bazelabs.netlify.app';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  // As páginas são estáticas. Só o painel /keystatic roda no servidor.
  output: 'static',
  adapter: netlify({
    imageCDN: false,
    // Em desenvolvimento não precisamos emular as funções da Netlify.
    devFeatures: false,
  }),
  devToolbar: { enabled: false },
  integrations: [
    react(),
    markdoc(),
    keystatic(),
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
    }),
  ],
});
