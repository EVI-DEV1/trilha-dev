# 2. Requisitos

## Histórias de usuário
| ID | Como… | quero… | para… |
|---|---|---|---|
| HU01 | estudante | ver meu progresso geral ao abrir o app | saber como estou de relance |
| HU02 | estudante | cadastrar uma trilha com seus módulos | organizar um curso novo |
| HU03 | estudante | marcar um módulo como concluído | registrar meu avanço |
| HU04 | estudante | ver qual é o próximo módulo pendente | não perder tempo decidindo |
| HU05 | estudante | usar um timer Pomodoro | manter o foco |
| HU06 | estudante | ver meus repositórios do GitHub | ligar estudo e prática |
| HU07 | recrutador | navegar pelo app publicado | avaliar o trabalho da autora |

## Requisitos funcionais
- **RF01** Listar trilhas com título, plataforma, categoria, cor e % de progresso.
- **RF02** Criar trilha (título ≥ 3 caracteres, plataforma, categoria, cor, módulos — um por linha).
- **RF03** Remover trilha.
- **RF04** Marcar/desmarcar módulo, salvando na API.
- **RF05** Painel com progresso geral, módulos concluídos, trilhas finalizadas e próximo passo.
- **RF06** Pomodoro 25/5 com iniciar, pausar, reiniciar e contagem de ciclos.
- **RF07** Buscar usuário do GitHub e exibir perfil + até 30 repositórios (sem forks), ordenados por atualização.
- **RF08** Mostrar mensagens amigáveis para erros de rede e da API.

## Requisitos não funcionais
- **RNF01** Responsivo de 360px a desktop.
- **RNF02** Acessibilidade: navegação por teclado, `aria-*` em barras de progresso, contraste AA.
- **RNF03** Tema claro/escuro seguindo o sistema operacional.
- **RNF04** Páginas carregadas sob demanda (lazy loading); bundle inicial < 500 kB.
- **RNF05** Código em TypeScript estrito; textos em pt-BR.
- **RNF06** Nenhum segredo (token) no código do front-end.

## Critérios de aceite (exemplo, HU03)
- Dado uma trilha com 3 módulos e 1 concluído, quando marco o 2º, então a barra vai para 67% imediatamente.
- Se a API falhar, o módulo volta ao estado anterior e aparece um aviso.
