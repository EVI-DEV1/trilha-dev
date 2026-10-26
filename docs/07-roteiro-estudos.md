# 7. Roteiro de estudos (6 semanas)

Ritmo sugerido: ~1h por dia, 5 dias por semana. Cada semana termina com um commit no GitHub. Marque os módulos na própria trilha **"Angular na prática"** do app 😉

## Semana 1 — Ambiente e fundamentos
- [ ] Instalar Node LTS, VS Code (+ extensão *Angular Language Service*) e Angular CLI: `npm i -g @angular/cli`.
- [ ] Rodar este projeto (`npm install` → `npm run dev`) e navegar por todas as páginas.
- [ ] Ler `main.ts`, `app.config.ts`, `app.component.ts`: como o app "liga".
- [ ] Estudar: componentes standalone, interpolação `{{ }}`, property binding `[ ]`, event binding `( )`.
- [ ] Exercício: mudar a saudação do início e o `nomeUsuario` em `environment.ts`.
- 📚 angular.dev → *Tutorials* e *Essentials*.

## Semana 2 — Templates e signals
- [ ] `@if`, `@for` (por que o `track` importa), `@empty`.
- [ ] `signal`, `computed`, `input()` — ler `TrilhasService`, `FocoService` e `AnelProgressoComponent`.
- [ ] Exercício: no painel, adicionar um card "Módulos pendentes" (`totalModulos - modulosConcluidos`).
- [ ] Exercício: fazer o anel do avatar ficar verde quando a trilha chegar a 100%.

## Semana 3 — Design no Figma
- [ ] Montar o arquivo do Figma seguindo `docs/05-design-figma.md`.
- [ ] Importar `design/tokens.json` (Variables ou Tokens Studio).
- [ ] Desenhar Painel e Detalhe em desktop e mobile; criar o protótipo.
- [ ] Exercício: mudar a cor primária no Figma → atualizar `tokens.json` → atualizar `styles.scss`. Ver o app mudar.

## Semana 4 — Rotas e formulários
- [ ] Rotas lazy (`loadComponent`), `routerLink`, `routerLinkActive`, parâmetro `:id` via `input()`.
- [ ] Formulários reativos: `FormBuilder`, `Validators`, estados `touched/invalid`.
- [ ] Exercício: criar a página **Sobre** (`features/sobre`) e adicionar ao menu — use a skill `criar-componente-angular`.
- [ ] Exercício: permitir editar o título de uma trilha (PATCH).

## Semana 5 — APIs
- [ ] `HttpClient`, Observables, `subscribe`, `forkJoin`, `finalize`.
- [ ] Interceptors: ler `erro-http.interceptor.ts`; desligar a API e ver a mensagem.
- [ ] Testar a API com curl/Thunder Client (`docs/04-apis.md`).
- [ ] Exercício: integrar a BrasilAPI de feriados e mostrar o próximo feriado no painel — use a skill `integrar-api`.

## Semana 6 — Qualidade e deploy
- [ ] Rodar `npm run build` e conferir o tamanho do bundle.
- [ ] Lighthouse no Chrome (meta ≥ 90 em Performance e Acessibilidade).
- [ ] Publicar no GitHub e na Vercel (`docs/08-git-deploy.md`).
- [ ] Adicionar o projeto ao portfólio com prints e link do Figma.
- [ ] Bônus: primeiro teste unitário (`TrilhasService.progressoGeral`).

## Conceitos para revisar ao final
Componente · template · binding · signal/computed · serviço e injeção de dependência · rota lazy · formulário reativo · Observable · interceptor · build/deploy.
