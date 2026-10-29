import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Os campos espelham o keystatic.config.ts. O Keystatic grava os arquivos e o Astro os lê.

const opcional = <T extends z.ZodType>(schema: T) => schema.nullish().transform((v) => v ?? undefined);

const pesquisa = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/pesquisa' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      data: z.coerce.date(),
      resumo: z.string(),
      capa: z
        .discriminatedUnion('discriminant', [
          z.object({ discriminant: z.literal(false) }),
          z.object({
            discriminant: z.literal(true),
            value: z.object({ imagem: image(), alt: z.string().min(1) }),
          }),
        ])
        .optional(),
      tags: z.array(z.string()).default([]),
      referencias: z.array(z.string()).default([]),
    }),
});

const galeria = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/galeria' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      ano: z.coerce.number().int(),
      ordem: opcional(z.number().int()),
      midia: z.string(),
      destaque: z.boolean().default(false),
      imagens: z
        .array(
          z.object({
            imagem: image(),
            alt: z.string().min(1),
            legenda: opcional(z.string()),
          }),
        )
        .min(1),
      video: z
        .discriminatedUnion('discriminant', [
          z.object({ discriminant: z.literal('nenhum') }),
          z.object({ discriminant: z.literal('link'), value: z.url() }),
          z.object({ discriminant: z.literal('arquivo'), value: z.string() }),
        ])
        .optional(),
      audio: opcional(z.string()),
      link: opcional(z.url()),
    }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/paginas' }),
  schema: ({ image }) =>
    z.object({
      // Home
      apresentacao: z.string().optional(),
      // Sobre
      foto: z
        .discriminatedUnion('discriminant', [
          z.object({ discriminant: z.literal(false) }),
          z.object({
            discriminant: z.literal(true),
            value: z.object({ imagem: image(), alt: z.string().min(1) }),
          }),
        ])
        .optional(),
      formacao: z.array(z.string()).default([]),
      email: opcional(z.string()),
      redes: z.array(z.object({ nome: z.string(), url: z.url() })).default([]),
    }),
});

export const collections = { pesquisa, galeria, paginas };
