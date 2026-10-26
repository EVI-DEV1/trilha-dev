# 6. Skills do Claude

Skills são pastas com um `SKILL.md` que ensinam o Claude a fazer uma tarefa do *seu jeito*. Neste projeto elas ficam em `.claude/skills/`, onde o Claude Code as encontra sozinho ao abrir a pasta do projeto. O arquivo `CLAUDE.md` na raiz dá o contexto geral do projeto.

| Skill | Quando usar | Exemplo de pedido |
|---|---|---|
| `criar-componente-angular` | Criar página ou componente seguindo as convenções | "cria um componente de card de meta semanal" |
| `integrar-api` | Consumir uma API nova (modelo + serviço + tratamento de erro) | "integra a API de feriados da BrasilAPI" |
| `figma-para-codigo` | Transformar um frame do Figma em componente usando os tokens | "implementa este frame: <link do Figma>" |
| `revisar-pr` | Revisar mudanças antes do commit/PR | "revisa o que eu mudei" |

## Como usar
- **Claude Code** (terminal ou VS Code): abra a pasta do projeto e peça normalmente; ou chame pelo nome, ex. `/criar-componente-angular`.
- **Claude no app**: as skills também podem ser salvas na sua conta (peça "salva a skill X na minha conta").

## Criando novas skills
Estrutura mínima:
```markdown
---
name: nome-da-skill
description: Uma frase dizendo QUANDO usar. É isso que faz o Claude escolher a skill.
---
# Passos
1. ...
```
Boas práticas: descrição específica, passos numerados, exemplos curtos de código, e uma checklist final.
