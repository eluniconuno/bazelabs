import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, textos } from '../lib/site';

export async function GET(context: APIContext) {
  const lista = await textos();
  return rss({
    title: 'Baze Labs · Pesquisa',
    description: SITE.descricao,
    site: context.site!,
    trailingSlash: true,
    customData: '<language>pt-BR</language>',
    items: lista.map((t) => ({
      title: t.data.titulo,
      pubDate: t.data.data,
      description: t.data.resumo,
      link: `/pesquisa/${t.id}/`,
      categories: t.data.tags,
      author: SITE.autor,
    })),
  });
}
