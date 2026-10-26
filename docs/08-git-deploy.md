# 8. Git e deploy

## Publicar no GitHub
```bash
git init
git add .
git commit -m "feat: estrutura inicial do Trilha Dev"
git branch -M main
git remote add origin https://github.com/EVI-DEV1/trilha-dev.git
git push -u origin main
```
Crie antes o repositório **trilha-dev** (público, para o My JSON Server conseguir ler o `db.json`).

### Padrão de commits (Conventional Commits)
`feat:` funcionalidade · `fix:` correção · `docs:` documentação · `style:` visual · `refactor:` reorganização · `chore:` configuração.

### Fluxo sugerido
Uma branch por funcionalidade (`feat/pagina-sobre`) → Pull Request → revisão (skill `revisar-pr`) → merge na `main`.

## Deploy na Vercel
1. vercel.com → **Add New → Project** → importar `EVI-DEV1/trilha-dev`.
2. A Vercel lê o `vercel.json`: build `npm run build`, saída `dist/trilha-dev/browser`, e o *rewrite* que faz as rotas do Angular funcionarem ao recarregar a página.
3. Cada push na `main` gera um deploy novo; cada PR ganha uma URL de pré-visualização.

## Verificação automática (CI)
O workflow em `.github/workflows/ci.yml` roda `npm ci` e `npm run build` a cada push na `main` e em cada Pull Request. Se o build quebrar, o GitHub avisa e o selo do README fica vermelho. Suba o `package-lock.json` junto (o `npm ci` precisa dele).

## Instalar como app (PWA)
O service worker só funciona no build de produção, servido por HTTPS: na Vercel ele já vem pronto.
- **Android (Chrome)**: abra o site → menu ⋮ → **Instalar app**.
- **iPhone (Safari)**: Compartilhar → **Adicionar à Tela de Início**.
- **Computador (Chrome/Edge)**: ícone de instalar na barra de endereço.

Para testar localmente: `npm run build` e depois `npx http-server dist/trilha-dev/browser -p 8080`.

## API em produção
- Demonstração: My JSON Server (já configurado em `environment.prod.ts`).
- Persistência real com login: Supabase. Preencha `supabase.url` e `supabase.anonKey` em `environment.prod.ts` (passo a passo em `docs/09-supabase.md`) e adicione a URL da Vercel em *Authentication → URL Configuration*.
