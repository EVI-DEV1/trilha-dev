# 4. APIs

## 4.1 API própria (json-server)
Base local: `http://localhost:3000` · arquivo de dados: `db.json` · subir com `npm run api`.

No app, as chamadas vão para `/api/...`; o `proxy.conf.json` do Angular repassa para a porta 3000. Assim front e API ficam na mesma origem (sem problemas de CORS).

| Método | Rota | Corpo | Uso no app |
|---|---|---|---|
| GET | `/trilhas` | — | Carregar todas as trilhas (ao abrir o app) |
| GET | `/trilhas/:id` | — | (disponível) uma trilha |
| POST | `/trilhas` | `Trilha` sem `id` | Criar trilha |
| PATCH | `/trilhas/:id` | `{ "modulos": [...] }` | Marcar/desmarcar módulo |
| DELETE | `/trilhas/:id` | — | Remover trilha |

### Modelo `Trilha`
```json
{
  "id": 6,
  "titulo": "Angular na prática",
  "plataforma": "Projeto próprio",
  "categoria": "front-end",
  "cor": "#DD0031",
  "modulos": [{ "id": 1, "titulo": "Signals e estado", "concluido": false }]
}
```
`categoria`: `fundamentos` | `front-end` | `design` | `ferramentas`.

### Testando sem o app
```bash
curl http://localhost:3000/trilhas
curl -X PATCH http://localhost:3000/trilhas/6 -H "Content-Type: application/json" \
     -d '{"modulos":[{"id":1,"titulo":"Signals e estado","concluido":true}]}'
```
Dica: a extensão **Thunder Client** (VS Code) ou o **Postman** também servem.

### Em produção
`environment.prod.ts` aponta para `https://my-json-server.typicode.com/EVI-DEV1/trilha-dev`, que lê o `db.json` do repositório público no GitHub. Leituras são reais; gravações respondem com sucesso mas **não persistem** (bom para demonstração). Para persistir de verdade, troque por Supabase/Firebase.

## 4.2 API do GitHub (pública)
Base: `https://api.github.com` · sem autenticação (limite: **60 requisições/hora por IP**).

| Método | Rota | Uso |
|---|---|---|
| GET | `/users/{login}` | Perfil: nome, avatar, bio, nº de repositórios e seguidores |
| GET | `/users/{login}/repos?sort=updated&per_page=30` | Repositórios recentes (o app filtra os forks) |

Campos usados estão em `core/models/github.model.ts`. Status tratados no interceptor: `0` (sem rede), `403` (limite excedido), `404` (usuário não existe).

> ⚠️ Nunca coloque um token do GitHub no front-end: ele fica visível para qualquer pessoa. Se precisar de mais requisições, crie uma função serverless (ex.: Vercel Functions) que guarda o token no servidor.

## 4.3 BrasilAPI: feriados nacionais
Base: `https://brasilapi.com.br/api` · pública, sem chave.

| Método | Rota | Uso |
|---|---|---|
| GET | `/feriados/v1/{ano}` | Lista de feriados nacionais do ano (`date`, `name`, `type`) |

O `FeriadosService.proximo()` pega o primeiro feriado a partir de hoje e, se o ano já acabou, consulta o ano seguinte. O resultado aparece no card **Próximo feriado** do painel.
- A requisição leva o token `SILENCIOSO` (`erro-http.interceptor.ts`): se a API falhar, o card simplesmente não aparece, sem aviso de erro na tela.
- O service worker guarda a resposta por 7 dias (`ngsw-config.json`, grupo `feriados`), então o card funciona offline.
- As datas chegam como `"AAAA-MM-DD"`; o serviço converte para data local para evitar que `new Date()` mostre o dia anterior por causa do fuso.

## 4.4 Ideias de APIs para próximas versões
- **Dev.to** (`/api/articles?tag=angular`) para sugerir leituras por tema da trilha.
