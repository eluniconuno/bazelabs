import { config, collection, singleton, fields } from '@keystatic/core';

/*
 * Painel de conteúdo do Baze Labs.
 * Em desenvolvimento, o conteúdo é salvo nos arquivos locais.
 * Em produção, cada publicação vira um commit no GitHub e a Netlify reconstrói o site.
 */

const REPO = 'eluniconuno/bazelabs';

// Em produção o painel usa o GitHub. Para configurar o GitHub App pela primeira vez
// no computador, rode com PUBLIC_KEYSTATIC_STORAGE=github (veja o GUIA-CMS.md).
const usarGithub = import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github';

const altObrigatorio = () =>
  fields.text({
    label: 'Texto alternativo',
    description:
      'Descreva a imagem para quem não pode vê-la. Obrigatório. Ex.: "Projeção azul sobre parede branca em sala escura".',
    validation: { length: { min: 1 } },
  });

// Imagem com texto alternativo obrigatório. Usada na capa e na foto do Sobre.
const imagemComAlt = (directory: string, publicPath: string, label: string) =>
  fields.object({
    imagem: fields.image({ label, directory, publicPath, validation: { isRequired: true } }),
    alt: altObrigatorio(),
  });

// Editor de texto longo. Imagens no corpo exigem texto alternativo, e o título vira legenda.
const corpoRico = (label: string, directory: string, publicPath: string) =>
  fields.markdoc({
    label,
    options: {
      heading: [2, 3],
      bold: true,
      italic: true,
      strikethrough: false,
      code: false,
      codeBlock: false,
      blockquote: true,
      orderedList: true,
      unorderedList: true,
      link: true,
      divider: true,
      table: false,
      image: {
        directory,
        publicPath,
        schema: {
          alt: altObrigatorio(),
          title: fields.text({ label: 'Legenda (opcional)' }),
        },
      },
    },
  });

const tituloComSlug = () =>
  fields.slug({
    name: { label: 'Título', validation: { length: { min: 1 } } },
    slug: {
      label: 'Endereço (slug)',
      description: 'Parte final do link. É gerado a partir do título.',
    },
  });

export default config({
  storage: usarGithub ? { kind: 'github', repo: REPO } : { kind: 'local' },
  ui: {
    brand: { name: 'Baze Labs' },
    navigation: {
      Conteúdo: ['pesquisa', 'galeria'],
      Páginas: ['home', 'sobre'],
    },
  },

  collections: {
    pesquisa: collection({
      label: 'Pesquisa',
      slugField: 'titulo',
      path: 'src/content/pesquisa/*',
      format: { contentField: 'corpo' },
      entryLayout: 'content',
      columns: ['titulo', 'data'],
      schema: {
        titulo: tituloComSlug(),
        data: fields.date({
          label: 'Data',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        resumo: fields.text({
          label: 'Resumo curto',
          description: 'Uma ou duas frases. Aparece na lista, na home e no compartilhamento.',
          multiline: true,
          validation: { length: { min: 1, max: 320 } },
        }),
        capa: fields.conditional(
          fields.checkbox({ label: 'Usar imagem de capa', defaultValue: false }),
          {
            true: imagemComAlt('src/assets/pesquisa', '../../assets/pesquisa/', 'Imagem de capa'),
            false: fields.empty(),
          },
        ),
        tags: fields.array(fields.text({ label: 'Tag', validation: { length: { min: 1 } } }), {
          label: 'Tags',
          itemLabel: (p) => p.value || 'Nova tag',
        }),
        referencias: fields.array(
          fields.text({ label: 'Referência', multiline: true, validation: { length: { min: 1 } } }),
          {
            label: 'Referências',
            description: 'Uma referência por item, no formato que preferir (ABNT, por exemplo).',
            itemLabel: (p) => p.value || 'Nova referência',
          },
        ),
        corpo: corpoRico('Texto', 'src/assets/pesquisa', '../../assets/pesquisa/'),
      },
    }),

    galeria: collection({
      label: 'Galeria',
      slugField: 'titulo',
      path: 'src/content/galeria/*',
      format: { contentField: 'descricao' },
      columns: ['titulo', 'ano'],
      schema: {
        titulo: tituloComSlug(),
        ano: fields.text({
          label: 'Ano',
          description: 'Quatro dígitos. Ex.: 2026.',
          validation: {
            length: { min: 4, max: 4 },
            pattern: { regex: /^\d{4}$/, message: 'Use quatro dígitos. Ex.: 2026.' },
          },
        }),
        ordem: fields.integer({
          label: 'Ordem no ano (opcional)',
          description: 'Desempata trabalhos do mesmo ano na numeração GAL. O menor número vem primeiro.',
        }),
        midia: fields.text({
          label: 'Mídia / técnica',
          description: 'Ex.: "Vídeo gerado por IA, som estéreo, 4 min".',
          validation: { length: { min: 1 } },
        }),
        destaque: fields.checkbox({ label: 'Destacar na home', defaultValue: false }),
        imagens: fields.array(
          fields.object({
            imagem: fields.image({
              label: 'Imagem',
              directory: 'src/assets/galeria',
              publicPath: '../../assets/galeria/',
              validation: { isRequired: true },
            }),
            alt: altObrigatorio(),
            legenda: fields.text({ label: 'Legenda (opcional)' }),
          }),
          {
            label: 'Imagens',
            description: 'A primeira imagem aparece na grade e no compartilhamento.',
            itemLabel: (p) => p.fields.alt.value || 'Nova imagem',
            validation: { length: { min: 1 } },
          },
        ),
        video: fields.conditional(
          fields.select({
            label: 'Vídeo',
            options: [
              { label: 'Sem vídeo', value: 'nenhum' },
              { label: 'Link do YouTube ou Vimeo', value: 'link' },
              { label: 'Arquivo de vídeo (MP4 curto)', value: 'arquivo' },
            ],
            defaultValue: 'nenhum',
          }),
          {
            nenhum: fields.empty(),
            link: fields.url({ label: 'Link do vídeo', validation: { isRequired: true } }),
            arquivo: fields.file({
              label: 'Arquivo de vídeo',
              description: 'Prefira vídeos curtos e leves, de até 20 MB. Para vídeos longos, use um link.',
              directory: 'public/media/galeria',
              publicPath: '/media/galeria/',
              validation: { isRequired: true },
            }),
          },
        ),
        audio: fields.file({
          label: 'Áudio (opcional)',
          description: 'Arquivo MP3 ou OGG.',
          directory: 'public/media/galeria',
          publicPath: '/media/galeria/',
        }),
        link: fields.url({
          label: 'Link externo da experiência (opcional)',
          description: 'Use quando o trabalho estiver hospedado em outro lugar.',
        }),
        descricao: corpoRico('Descrição', 'src/assets/galeria', '../../assets/galeria/'),
      },
    }),
  },

  singletons: {
    home: singleton({
      label: 'Home',
      path: 'src/content/paginas/home',
      format: { contentField: 'manifesto' },
      schema: {
        apresentacao: fields.text({
          label: 'Apresentação',
          description: 'Aparece junto ao nome. Ex.: "artista visual".',
          defaultValue: 'artista visual',
          validation: { length: { min: 1 } },
        }),
        manifesto: fields.markdoc({
          label: 'Manifesto',
          options: {
            heading: false,
            image: false,
            table: false,
            code: false,
            codeBlock: false,
            divider: false,
            orderedList: false,
            unorderedList: false,
            blockquote: false,
            strikethrough: false,
          },
        }),
      },
    }),

    sobre: singleton({
      label: 'Sobre',
      path: 'src/content/paginas/sobre',
      format: { contentField: 'texto' },
      schema: {
        foto: fields.conditional(fields.checkbox({ label: 'Mostrar foto', defaultValue: false }), {
          true: imagemComAlt('src/assets/sobre', '../../assets/sobre/', 'Foto'),
          false: fields.empty(),
        }),
        formacao: fields.array(
          fields.text({ label: 'Formação', validation: { length: { min: 1 } } }),
          { label: 'Formação', itemLabel: (p) => p.value || 'Nova formação' },
        ),
        email: fields.text({ label: 'E-mail de contato' }),
        redes: fields.array(
          fields.object({
            nome: fields.text({ label: 'Nome da rede', validation: { length: { min: 1 } } }),
            url: fields.url({ label: 'Link', validation: { isRequired: true } }),
          }),
          { label: 'Redes', itemLabel: (p) => p.fields.nome.value || 'Nova rede' },
        ),
        texto: fields.markdoc({
          label: 'Texto',
          options: {
            heading: [2, 3],
            image: false,
            table: false,
            code: false,
            codeBlock: false,
          },
        }),
      },
    }),
  },
});
