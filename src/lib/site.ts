import { getCollection, type CollectionEntry } from 'astro:content';

export const SITE = {
  nome: 'Baze Labs',
  autor: 'Emanuel Eidt',
  assinatura: 'Digital art research engine by Emanuel Eidt',
  descricao:
    'Baze Labs é o espaço de pesquisa em arte digital de Emanuel Eidt, artista visual: inteligência artificial, novas mídias, estudos visuais e poéticas sonoras.',
  idioma: 'pt-BR',
};

export const NAV = [
  { href: '/pesquisa/', rotulo: 'Pesquisa' },
  { href: '/galeria/', rotulo: 'Galeria' },
  { href: '/sobre/', rotulo: 'Sobre' },
];

export type Texto = CollectionEntry<'pesquisa'> & { numero: string };
export type Trabalho = CollectionEntry<'galeria'> & { numero: string };

const codigo = (prefixo: string, n: number) => `${prefixo}-${String(n).padStart(3, '0')}`;

/**
 * Textos do mais recente ao mais antigo.
 * A numeração segue a ordem de publicação: o texto mais antigo é PSQ-001.
 */
export async function textos(): Promise<Texto[]> {
  const todos = await getCollection('pesquisa');
  const cronologico = [...todos].sort(
    (a, b) => a.data.data.getTime() - b.data.data.getTime() || a.id.localeCompare(b.id),
  );
  return cronologico.map((t, i) => ({ ...t, numero: codigo('PSQ', i + 1) })).reverse();
}

/**
 * Trabalhos do mais recente ao mais antigo.
 * A numeração segue o ano: o trabalho mais antigo é GAL-001.
 */
export async function trabalhos(): Promise<Trabalho[]> {
  const todos = await getCollection('galeria');
  const cronologico = [...todos].sort(
    (a, b) => a.data.ano - b.data.ano || a.data.titulo.localeCompare(b.data.titulo, 'pt-BR'),
  );
  return cronologico.map((t, i) => ({ ...t, numero: codigo('GAL', i + 1) })).reverse();
}

const fmtData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
const fmtDataLonga = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** 14.09.2026 */
export const dataCurta = (d: Date) => fmtData.format(d).replaceAll('/', '.');
/** 14 de setembro de 2026 */
export const dataLonga = (d: Date) => fmtDataLonga.format(d);
/** 2026-09-14, para o atributo datetime */
export const dataISO = (d: Date) => d.toISOString().slice(0, 10);

/** Converte um link do YouTube ou do Vimeo no endereço do player incorporado. */
export function embedDeVideo(url: string): { src: string; servico: string } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    return id ? { src: `https://www.youtube-nocookie.com/embed/${id}`, servico: 'YouTube' } : null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id =
      u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ?? null;
    return id ? { src: `https://www.youtube-nocookie.com/embed/${id}`, servico: 'YouTube' } : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.match(/(\d{5,})/)?.[1];
    return id ? { src: `https://player.vimeo.com/video/${id}?dnt=1`, servico: 'Vimeo' } : null;
  }
  return null;
}

/** Domínio legível de um link externo. */
export const dominio = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};
