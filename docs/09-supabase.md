# 9. Login e dados na nuvem (Supabase)

O app funciona em dois modos, escolhidos pelo `environment`:

| Modo | Quando | Dados | Login |
|---|---|---|---|
| **Local** | `supabase.url` vazio (padrão) | `db.json` via json-server | não tem |
| **Nuvem** | `supabase.url` e `supabase.anonKey` preenchidos | tabela `trilhas` no Supabase (Postgres) | e-mail e senha |

O código das páginas é o mesmo nos dois modos: elas falam com o `TrilhasService`, que usa um **repositório** (`core/data/repositorio-trilhas.ts`). Trocar a fonte de dados não mexe em nenhuma tela. Esse é o padrão *Repository*, ótimo para citar em entrevista.

## Passo a passo (≈10 minutos, grátis)
1. Crie uma conta em **supabase.com** (dá para entrar com o GitHub) e clique em **New project**. Escolha a região **South America (São Paulo)** e anote a senha do banco.
2. Quando o projeto terminar de criar, abra **SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**. Deve aparecer "Success".
3. Vá em **Project Settings → API** (ou **Data API / API Keys**) e copie:
   - **Project URL** (ex.: `https://abcd1234.supabase.co`)
   - **anon public key** (ou *publishable key*, que começa com `sb_publishable_`)
4. Cole os dois em `src/environments/environment.ts` **e** em `environment.prod.ts`:
   ```ts
   supabase: { url: 'https://abcd1234.supabase.co', anonKey: 'eyJhbGciOi...' },
   ```
5. Para testar mais rápido: **Authentication → Sign In / Providers → Email** e desligue **Confirm email**. Assim a conta já entra direto, sem precisar confirmar por e-mail. (Religue antes de divulgar o app.)
6. Em **Authentication → URL Configuration**, coloque em *Site URL* o endereço do app (`http://localhost:4200` agora; depois o da Vercel).
7. Rode o app, crie sua conta na tela **Entrar** e, no Início, toque em **Escolher meu curso** e marque as matérias sugeridas.

## Segurança
- A chave **anon/publishable** foi feita para ficar no front-end. Quem protege os dados é o **RLS** do `schema.sql`: cada linha tem `user_id` e as políticas só liberam as linhas do usuário logado.
- **Nunca** coloque a chave `service_role` / `secret` no app. Ela ignora o RLS.

## Como funciona no código
- `core/data/supabase.ts`: cria o cliente uma vez só (e só no modo nuvem).
- `core/services/auth.service.ts`: sessão em um `signal`; entrar, criar conta, sair; mensagens de erro em português.
- `core/guards/auth.guard.ts`: sem sessão, as rotas mandam para `/entrar`.
- `app.component.ts`: um `effect` carrega as trilhas ao entrar e limpa ao sair.

## Problemas comuns
| Mensagem | Solução |
|---|---|
| "Tabela trilhas não encontrada" | Rode o `schema.sql` no SQL Editor |
| "Confirme seu e-mail…" | Clique no link do e-mail ou desligue *Confirm email* (passo 5) |
| Lista vazia depois de entrar | Normal numa conta nova: use **Escolher meu curso** |
| `Invalid API key` | Confira se copiou a chave **anon/publishable**, sem espaços |
