# Trilha Dev 🧭

[![CI](https://github.com/EVI-DEV1/trilha-dev/actions/workflows/ci.yml/badge.svg)](https://github.com/EVI-DEV1/trilha-dev/actions/workflows/ci.yml)

Planner de estudos para devs, feito em **Angular 19**: organize trilhas e módulos, acompanhe seu progresso, estude com um timer Pomodoro e veja seus repositórios pela **API do GitHub**. O design nasce no **Figma** e vira código por meio de *design tokens*, e o projeto já vem com **skills do Claude** para acelerar o dia a dia.

> Projeto de portfólio de **Eliane Vitoriano Luiz** · GitHub [EVI-DEV1](https://github.com/EVI-DEV1) · [evi-dev.vercel.app](https://evi-dev.vercel.app)

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | Angular 19 (standalone, signals, controle de fluxo `@if/@for`, lazy loading) |
| Estilo | Design system "Céu" (SCSS + CSS custom properties dos tokens do Figma), temas escuro e claro, mascote Bento |
| Dados | Supabase (Postgres + Auth + RLS) **ou** json-server no modo local, via padrão Repository |
| APIs | API REST pública do GitHub |
| PWA | `@angular/service-worker`, manifest e ícones: instalável e com cache offline |
| CI | GitHub Actions: build a cada push e pull request |
| Design | Figma (Variables + Tokens Studio) → `design/tokens.json` |
| IA | Skills do Claude em `.claude/skills/` + `CLAUDE.md` |
| Deploy | Vercel (front) + My JSON Server (API de demonstração) |

## Como rodar

Pré-requisitos: Node.js 20 LTS ou mais novo e npm.

```bash
npm install
npm run dev        # sobe a API (porta 3000) e o Angular (porta 4200) juntos
```

Ou em dois terminais: `npm run api` e `npm start`. Abra http://localhost:4200.
No Windows, basta dar dois cliques em `iniciar.bat`.

Para login e dados na nuvem, siga [docs/09-supabase.md](docs/09-supabase.md).

## Funcionalidades

- **Boas-vindas**: três telas ilustradas no primeiro acesso.
- **Conta** (modo nuvem): criar conta, entrar e sair; cada pessoa vê só as próprias trilhas.
- **Início**: anel de progresso geral, semana de estudos com sequência de dias 🔥, avatares das trilhas **meta semanal** de foco e **plano de hoje** (conclua o próximo módulo direto daqui). Concluir uma trilha dispara uma comemoração com confete 🎉.
- **Sugestões por curso**: a pessoa diz o que estuda (Engenharia de Software, ADS, Ciência da Computação, Front-end, Dados, UX/UI…) e recebe matérias e temas prontos, com módulos, para virar trilhas. O curso fica salvo na conta.
- **Trilhas**: busca, filtro por categoria e criação de trilha num painel que sobe da parte de baixo, com escolha de cor.
- **Detalhe**: marcar, adicionar e remover módulos, **anotações por módulo**, **estudar um módulo com o timer** e ver os minutos de foco da trilha; excluir trilha (com confirmação).
- **Foco**: Pomodoro de 5, 25 ou 50 min que **continua rodando ao trocar de página**, com histórico de 7 dias salvo no navegador e notificação ao fim de cada fase.
- **Instalável** no celular e no computador (PWA).
- **GitHub**: perfil e repositórios de qualquer usuário, com filtro por linguagem.

## Documentação

Tudo está em [`docs/`](docs/README.md): visão do produto, requisitos, arquitetura, APIs, guia de design no Figma, skills do Claude, roteiro de estudos e deploy.
