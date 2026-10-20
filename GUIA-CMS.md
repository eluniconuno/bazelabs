# Guia do painel · Baze Labs

Este guia explica como publicar um texto na Pesquisa e um trabalho na Galeria pelo painel do site, sem mexer no código.

O painel fica em **seudominio/keystatic**. Por exemplo: `https://bazelabs.netlify.app/keystatic`.

Os botões do painel estão em inglês. Os principais são **Create** (criar), **Save** (salvar), **Add** (adicionar), **Choose file** (escolher arquivo) e **Remove** (remover).

---

## Como funciona

1. Você entra no painel com a sua conta do GitHub.
2. Cada vez que você salva, o painel grava a mudança no repositório `eluniconuno/bazelabs`.
3. A Netlify percebe a mudança e reconstrói o site. Em cerca de um ou dois minutos a página nova está no ar.

Se a página não mudar logo, espere um pouco e recarregue. Você acompanha cada atualização em **Deploys**, no painel da Netlify.

---

## Publicar um texto na Pesquisa

1. Abra o painel e clique em **Pesquisa**, na barra lateral.
2. Clique em **Add** para criar um texto novo.
3. Preencha os campos:
   - **Título.** O endereço da página é gerado a partir dele. Por exemplo, "O ruído como matéria" vira `/pesquisa/o-ruido-como-materia/`.
   - **Data.** Ela define a ordem da lista e a numeração (PSQ-001, PSQ-002...). O texto mais antigo é o número 1.
   - **Resumo curto.** Uma ou duas frases. Aparece na lista, na home e quando alguém compartilha o link.
   - **Usar imagem de capa.** Marque se quiser uma capa. Escolha a imagem e escreva o **texto alternativo**.
   - **Tags.** Clique em **Add** para cada tag.
   - **Referências.** Clique em **Add** para cada referência, no formato que preferir.
   - **Texto.** O corpo do texto. Veja abaixo como usar o editor.
4. Clique em **Create**. O texto é publicado.

### O editor de texto

- **Subtítulos.** No menu à esquerda da barra, troque "Paragraph" por "Heading 2" ou "Heading 3".
- **Negrito e itálico.** Use os botões **B** e *I*, ou Ctrl+B e Ctrl+I.
- **Citação.** Use o botão de aspas. A citação aparece com a barra azul.
- **Listas.** Use os botões de lista com marcadores ou numerada.
- **Link.** Selecione as palavras e clique no botão de corrente.
- **Linha divisória.** Use o botão de traço horizontal.
- **Imagem no meio do texto.** Clique no botão de imagem e escolha o arquivo. Depois clique na imagem para preencher o **texto alternativo**, que é obrigatório, e a **legenda**, que é opcional.

### Editar ou apagar um texto

Abra **Pesquisa** e clique no texto. Para editar, mude o que quiser e clique em **Save**. Para apagar, use o ícone de lixeira no alto da página.

---

## Publicar um trabalho na Galeria

1. Abra o painel e clique em **Galeria**.
2. Clique em **Add**.
3. Preencha os campos:
   - **Título.**
   - **Ano.** Quatro dígitos, por exemplo 2026. O ano define a ordem e a numeração (GAL-001, GAL-002...).
   - **Mídia / técnica.** Por exemplo: "Vídeo gerado por IA, som estéreo, 4 min".
   - **Destacar na home.** Marque para o trabalho aparecer na página inicial. Se nenhum trabalho estiver marcado, a home mostra os mais recentes.
   - **Imagens.** Clique em **Add** para cada imagem. Escolha o arquivo e escreva o **texto alternativo**. A legenda é opcional. A primeira imagem aparece na grade e no compartilhamento. Arraste os itens para mudar a ordem.
   - **Vídeo.** Escolha uma opção:
     - **Sem vídeo.**
     - **Link do YouTube ou Vimeo.** Cole o link do vídeo. É a melhor opção para vídeos longos.
     - **Arquivo de vídeo.** Envie um MP4 curto, de até 20 MB. Arquivos grandes deixam o repositório pesado.
   - **Áudio.** Opcional. Envie um MP3 ou OGG.
   - **Link externo da experiência.** Opcional. Use quando o trabalho estiver hospedado em outro site. Na página aparece um botão "Abrir a experiência".
   - **Descrição.** Texto sobre o trabalho, com o mesmo editor da Pesquisa.
4. Clique em **Create**.

---

## Home e Sobre

Na barra lateral, em **Páginas**:

- **Home.** Aqui ficam a apresentação que aparece junto ao nome ("artista visual") e o texto do manifesto.
- **Sobre.** Aqui ficam o texto, a foto, a formação, o e-mail de contato e as redes. Para mostrar uma foto, marque **Mostrar foto**, escolha a imagem e escreva o texto alternativo.

Depois de editar, clique em **Save**.

---

## Como escrever um bom texto alternativo

O texto alternativo é lido por quem usa leitor de tela e aparece quando a imagem não carrega. O painel não deixa salvar sem ele.

- Descreva o que está na imagem, em uma ou duas frases.
- Não comece com "imagem de" ou "foto de".
- Se a imagem tem texto escrito, inclua esse texto.
- Exemplo: "Projeção azul sobre parede branca em sala escura, com três pessoas de costas".

---

## Tamanho das imagens

O site otimiza as imagens sozinho, então você pode enviar arquivos JPG ou PNG em boa qualidade. O ideal é que tenham entre 1600 e 3000 pixels no lado maior e até 5 MB.

---

## Configuração inicial

Esta parte é feita uma única vez, para publicar o site na Netlify e ligar o painel ao GitHub.

### 1. Publicar o site na Netlify

1. Na Netlify, clique em **Add new site** e depois em **Import an existing project**. Escolha o GitHub e o repositório `eluniconuno/bazelabs`.
2. As configurações de build vêm do arquivo `netlify.toml`. Não é preciso mudar nada.
3. Faça o deploy e anote o endereço do site, por exemplo `https://bazelabs.netlify.app`.

O site já funciona nesse momento. Só o painel ainda não, porque falta o GitHub App.

### 2. Criar o GitHub App do painel

1. No computador, crie um arquivo `.env` na pasta do projeto com esta linha:

   ```
   PUBLIC_KEYSTATIC_STORAGE=github
   ```

2. Rode `npm run dev`, abra `http://127.0.0.1:4321/keystatic` e clique em **Log in with GitHub**. O painel abre a tela **Keystatic Setup**.
3. Em **Deployed App URL**, cole o endereço do site na Netlify. Deixe **GitHub organization** em branco.
4. Clique em **Create GitHub App** e siga as telas do GitHub. Dê ao app um nome como "Baze Labs CMS".
5. Ao voltar, o Keystatic grava no `.env` quatro variáveis: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` e `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
6. Quando o GitHub pedir, instale o app no repositório `eluniconuno/bazelabs`.
7. Apague a linha `PUBLIC_KEYSTATIC_STORAGE=github` do `.env`. Assim o painel do computador volta a editar os arquivos locais.

O arquivo `.env` guarda segredos. Ele nunca vai para o GitHub, porque está no `.gitignore`.

### 3. Levar as variáveis para a Netlify

1. Na Netlify, abra **Site configuration** e depois **Environment variables**.
2. Adicione as quatro variáveis do `.env`, com os mesmos valores.
3. Em **Deploys**, clique em **Trigger deploy** para publicar de novo.
4. Abra `https://bazelabs.netlify.app/keystatic` e entre com o GitHub.

### Se o endereço do site mudar

Se você usar um domínio próprio, faça duas coisas:

1. No GitHub, abra **Settings**, depois **Developer settings**, **GitHub Apps** e o app criado. Em **Callback URL**, adicione o domínio novo seguido de `/api/keystatic/github/oauth/callback`. Por exemplo:

   ```
   https://bazelabs.com.br/api/keystatic/github/oauth/callback
   ```

2. Na Netlify, crie a variável `SITE_URL` com o endereço completo, por exemplo `https://bazelabs.com.br`. Ela corrige os links de compartilhamento, o RSS e o sitemap.

---

## Trabalhar no computador (opcional)

1. Rode `npm install` uma vez.
2. Rode `npm run dev` e abra `http://127.0.0.1:4321`.
3. O painel local fica em `http://127.0.0.1:4321/keystatic`. Nele as mudanças são gravadas direto nos arquivos da pasta, sem passar pelo GitHub.
4. Para publicar o que fez no computador, faça commit e push para o GitHub.
