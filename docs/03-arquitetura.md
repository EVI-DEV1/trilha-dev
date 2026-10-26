# 3. Arquitetura

## Visão geral
```
[Figma] --tokens.json--> [styles.scss]
                              |
[Componentes (features)] <--signals-- [Serviços (core)] --HttpClient--> [json-server :3000]
                                              |                     \--> [api.github.com]
                                     [erro-http.interceptor] --> [AvisoService] --> toast
```

## Pastas
```
src/app/
├── app.component.ts        casca: cabeçalho, menu, <router-outlet>, toast
├── app.config.ts           providers: router, HttpClient + interceptor
├── app.routes.ts           rotas lazy (loadComponent)
├── core/
│   ├── data/               repositório (json-server | Supabase), cliente Supabase, catálogo de cursos e sugestões (cursos.ts)
│   ├── guards/             authGuard, visitanteGuard
│   ├── models/             interfaces (Trilha, Modulo, GithubUsuario…)
│   ├── services/           TrilhasService, AuthService, FocoService, GithubService, AvisoService
│   └── interceptors/       erro-http.interceptor.ts
├── shared/                 Topo, AnelProgresso, AvatarTrilha, Icone, Folha
└── features/
    ├── entrar/             login e cadastro (modo nuvem)
    ├── dashboard/          início
    ├── trilhas/            lista + formulário, detalhe
    ├── foco/               Pomodoro
    └── github/             perfil e repositórios
```

## Decisões técnicas
| Decisão | Por quê |
|---|---|
| Componentes standalone (sem NgModules) | Padrão do Angular moderno; menos código de configuração |
| Signals para estado | Reatividade simples e explícita; `computed` deriva progresso sem recalcular à mão |
| Serviço como "store" | Só o `TrilhasService` altera o estado; componentes apenas leem — fácil de depurar |
| Timer no serviço (`FocoService`) | O Pomodoro vive fora da página, então continua rodando ao navegar; histórico salvo no `localStorage` |
| Padrão Repository (`REPOSITORIO_TRILHAS`) | Mesma interface para json-server e Supabase; o modo é escolhido pelo `environment` |
| Supabase com RLS | Login pronto e segurança no banco: a chave pública pode ficar no front |
| PWA com `@angular/service-worker` | App instalável e com cache offline, sem mudar o código das páginas |
| Atualização otimista | A tela responde na hora ao marcar um módulo; desfaz se a API falhar |
| Interceptor funcional de erros | Mensagens de erro em um só lugar, nada de `catchError` repetido nos componentes |
| `withComponentInputBinding` | O `:id` da rota chega como `input()` no componente, sem `ActivatedRoute` |
| Proxy do dev server (`proxy.conf.json`) | O front chama `/api` na mesma origem; evita CORS e imita o deploy real |
| json-server | API REST real (GET/POST/PATCH/DELETE) sem precisar escrever back-end agora |
| Tokens → CSS variables | Um só lugar para cores/espaços; tema escuro com `prefers-color-scheme` |

## Fluxo: marcar um módulo
1. Usuário clica no checkbox (`TrilhaDetalheComponent`).
2. `TrilhasService.alternarModulo()` atualiza o signal `_trilhas` → painel e barra mudam na hora.
3. Envia `PATCH /trilhas/:id` com a lista de módulos.
4. Em erro: o interceptor mostra o aviso e o serviço restaura a trilha original.

## Evoluções possíveis
- Trocar json-server por um back-end real (Supabase, Firebase ou Node/Nest).
- Testes unitários com Vitest/Jest e e2e com Playwright.
- Transformar em PWA (`ng add @angular/pwa`).
