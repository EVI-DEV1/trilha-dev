---
name: integrar-api
description: Use ao consumir uma API REST nova no Trilha Dev — cria modelo tipado, serviço com HttpClient, tratamento de erro e documenta em docs/04-apis.md.
---
# Integrar uma API

1. **Investigar**: ler a documentação da API; anotar URL base, rotas, parâmetros, limite de requisições e se exige token. Se exigir token, **não** colocar no front-end — propor uma função serverless.
2. **Modelo**: criar `src/app/core/models/<api>.model.ts` só com os campos usados.
3. **Ambiente**: adicionar a URL base em `environment.ts` e `environment.prod.ts`.
4. **Serviço**: `src/app/core/services/<api>.service.ts`, `@Injectable({ providedIn: 'root' })`, `inject(HttpClient)`, métodos que retornam `Observable<Tipo>`; parâmetros com `HttpParams`; `encodeURIComponent` em valores digitados pelo usuário.
5. **Erros**: se a API tiver códigos próprios, acrescentar mensagens em `mensagemPara()` no `erro-http.interceptor.ts`.
6. **Componente**: guardar resultado em `signal`, controlar `carregando`, mostrar estados de carregando / vazio / erro.
7. **Documentar**: nova seção em `docs/04-apis.md` com tabela Método | Rota | Uso.
8. **Testar**: chamar a rota com `curl` antes, depois rodar o app e simular falha (desligar a internet).
