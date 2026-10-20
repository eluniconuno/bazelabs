import { defineMarkdocConfig, component, nodes, Markdoc } from '@astrojs/markdoc/config';

// Um parágrafo que só contém imagens vira figura solta, sem <p> em volta.
function soImagens(node) {
  if (node.children.length !== 1) return false;
  const inline = node.children[0];
  if (inline?.type !== 'inline' || inline.children.length === 0) return false;
  let temImagem = false;
  for (const filho of inline.children) {
    if (filho.type === 'image') temImagem = true;
    else if (filho.type === 'softbreak') continue;
    else if (filho.type === 'text' && !String(filho.attributes.content ?? '').trim()) continue;
    else return false;
  }
  return temImagem;
}

export default defineMarkdocConfig({
  nodes: {
    // O documento vira um <div class="fluxo">, e não um <article> dentro do artigo da página.
    document: {
      ...Markdoc.nodes.document,
      transform(node, config) {
        return new Markdoc.Tag('div', { class: 'fluxo' }, node.transformChildren(config));
      },
    },
    image: {
      ...nodes.image,
      render: component('./src/components/Figura.astro'),
    },
    paragraph: {
      ...Markdoc.nodes.paragraph,
      transform(node, config) {
        if (soImagens(node)) {
          return node.children[0].transformChildren(config);
        }
        return new Markdoc.Tag('p', node.transformAttributes(config), node.transformChildren(config));
      },
    },
  },
});
