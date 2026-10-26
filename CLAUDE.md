# Contexto do projeto para o Claude

Projeto **Trilha Dev**: app Angular 19 de planejamento de estudos. Autora: Eliane (GitHub EVI-DEV1). Idioma do código, comentários e textos da interface: **português do Brasil**.

## Convenções
- Componentes **standalone**, um por arquivo, template e estilos inline enquanto couberem em ~80 linhas; acima disso, separar em `.html`/`.scss`.
- Estado com **signals** (`signal`, `computed`, `input()`). RxJS só para HTTP e fluxos assíncronos.
- Use `inject()` em vez de injeção pelo construtor.
- Controle de fluxo novo: `@if`, `@for` (sempre com `track`), `@empty`.
- Nada de cores "soltas": use os tokens de `src/styles.scss` (`--fundo`, `--superficie*`, `--texto*`, `--acento*`, `--borda*`, `--r-*`), que funcionam nos temas escuro e claro. Exceção: o mascote Bento (gatinho neon) tem cores próprias.
- Tipografia: `--serif` (Playfair Display) para títulos, `--sans` (DM Sans) para texto, `--mono` (DM Mono) para rótulos.
- Mascote: `<app-mascote pose="acenando|lendo|foco|comemorando|pensando">` em estados vazios e momentos de celebração.
- Chamadas HTTP só dentro de `core/services/`. Erros são tratados no `erro-http.interceptor.ts`.
- Rotas novas em `app.routes.ts` com `loadComponent` (lazy).

## Estrutura
- `src/app/core/` modelos, serviços, interceptors
- `src/app/shared/` componentes reutilizáveis
- `src/app/features/<pagina>/` páginas
- `docs/` documentação · `design/` tokens do Figma · `.claude/skills/` skills do projeto (carregadas sozinhas pelo Claude Code)

## Comandos
- `npm run dev` API + front · `npm run build` build de produção
