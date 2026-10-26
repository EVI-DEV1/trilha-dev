---
name: revisar-pr
description: Use para revisar as mudanças do Trilha Dev antes de um commit ou pull request.
---
# Revisar mudanças

1. Ver o que mudou: `git status` e `git diff` (ou `git diff main...HEAD` numa branch).
2. Conferir, arquivo por arquivo:
   - **Correção**: lógica certa, signals atualizados com `set/update` (nunca mutar arrays), `subscribe` com tratamento de erro quando necessário.
   - **Convenções** (`CLAUDE.md`): standalone, `inject()`, `@for` com `track`, HTTP só em serviços, tokens em vez de valores soltos, textos em pt-BR.
   - **Acessibilidade**: rótulos, `alt`, contraste, teclado.
   - **Segurança**: nenhum token/segredo commitado; `rel="noopener"` em links externos.
   - **Docs**: README/`docs/` atualizados se mudou API, rota ou comando.
3. Rodar `npm run build`.
4. Responder com: ✅ o que está bom · ⚠️ problemas (arquivo:linha, por quê, sugestão) · 💬 sugestão de mensagem de commit no padrão Conventional Commits.
