# 5. Design no Figma — design system "Céu"

## Conceito
Visual de **app de produto**, noturno e calmo, com toque editorial. O tema segue o do sistema operacional por padrão (a pessoa pode fixar Escuro ou Claro na tela Conta):
- **Azul-noite** como fundo no tema escuro (o padrão) e **branco-gelo** no tema claro.
- **Azul-céu** como cor de ação e destaque (`--acento`).
- Títulos em **serifa** (Playfair Display), com uma palavra em *itálico azul* para dar ritmo: "Bom dia, *Eliane*".
- Rótulos pequenos em **mono maiúsculo** (`.rotulo-mono`), como legendas técnicas.
- **Canto-assinatura**: o painel de destaque tem um único canto grande (`4px 28px 4px 4px`). É a marca visual do app; use só em um elemento por tela.
- Progresso sempre em **anéis** (painel, avatar da trilha, timer).
- **Bento**, o gatinho de contorno neon, aparece em estados vazios, nas boas-vindas e nas comemorações.

Layout: no desktop, **barra lateral** de 248px à esquerda; no celular, **topo** de 60px e **navegação inferior** de 68px.

## Estrutura do arquivo
Crie um arquivo "Trilha · Céu" com estas páginas:

1. **🎨 Fundamentos**: cores (dois modos), tipografia, raios, sombras, canto-assinatura, paleta das trilhas.
2. **🐱 Bento**: o mascote nas 5 poses (`acenando`, `lendo`, `foco`, `comemorando`, `pensando`) e o logotipo (`app-marca`).
3. **🧩 Componentes**: Botão (primário, secundário, fantasma, perigo, ícone; tamanhos sm/padrão/lg), Campo (padrão, com erro, com dica), Chip, Etiqueta, Segmentos, Busca, Painel (normal e destaque), Anel de progresso, Avatar de trilha, Folha (painel que sobe de baixo), Foco flutuante (mini-timer), Navegação (lateral e inferior).
4. **📱 Telas**, em dois tamanhos (desktop 1440×900 e celular 390×844): Boas-vindas, Entrar, Painel, Trilhas, Nova trilha (folha aberta), Detalhe da trilha, Foco, Portfólio/GitHub, Conta, Baixar.
5. **🔀 Protótipo**: Boas-vindas → Entrar → Painel; Painel → tocar no "plano de hoje" → Detalhe; Trilhas → "Nova trilha" → Folha → Detalhe; Detalhe → "Estudar este módulo" → Foco.
6. **🗒️ Handoff**: links dos frames para usar com a skill `figma-para-codigo`.

## Tokens
A fonte única de verdade é `design/tokens.json`. Duas formas de levar para o Figma:
- **Tokens Studio** (plugin): *Load from file* → `design/tokens.json`. Crie os temas `escuro` e `claro` a partir de `cor/escuro` e `cor/claro`.
- **Variables** (nativo): crie a coleção **Cor** com os modos **Escuro** e **Claro** e uma variável para cada chave abaixo.

| Figma (Variable) | CSS em `src/styles.scss` | Escuro | Claro |
|---|---|---|---|
| `Cor/fundo` | `var(--fundo)` | #0A1020 | #F3F6FB |
| `Cor/fundo-2` | `var(--fundo-2)` | #0D1427 | #E9EEF7 |
| `Cor/superficie` | `var(--superficie)` | #121B31 | #FFFFFF |
| `Cor/superficie-2` | `var(--superficie-2)` | #18233D | #F2F5FB |
| `Cor/superficie-3` | `var(--superficie-3)` | #22304F | #E3E9F4 |
| `Cor/texto` | `var(--texto)` | #EEF3FF | #0E1830 |
| `Cor/texto-2` | `var(--texto-2)` | #B9C4DC | #3B4A66 |
| `Cor/texto-suave` | `var(--texto-suave)` | #8794B0 | #66748F |
| `Cor/acento` | `var(--acento)` | #5B8DEF | #2F63D1 |
| `Cor/acento-claro` | `var(--acento-claro)` | #84AAF5 | #3A6FD8 |
| `Cor/acento-escuro` | `var(--acento-escuro)` | #3A6FD8 | #234FAE |
| `Cor/sobre-acento` | `var(--sobre-acento)` (texto e ícones sobre o acento) | #0A1020 | #FFFFFF |
| `Cor/sucesso` | `var(--sucesso)` | #4FC3A1 | #1F9A78 |
| `Cor/erro` | `var(--erro)` | #F07A7A | #C9423F |

Bordas são transparências (no escuro, azul-claro a 10% e 20%; no claro, azul-noite a 9% e 18%). No Figma, use a cor com opacidade em vez de um hex sólido.

Outras coleções:

| Figma | CSS | Valor |
|---|---|---|
| `Raio/r-1` · `r-2` · `r-3` | `var(--r-1)` … `var(--r-3)` | 6 · 10 · 16px |
| `Raio/pilula` | `var(--pilula)` | 999px |
| `Raio/assinatura` | `var(--r-assinatura)` | 4 · 28 · 4 · 4px |
| `Cor-trilha/t1…t6` | cor escolhida pela pessoa ao criar a trilha | #5B8DEF · #4FC3A1 · #F2B45A · #E9798A · #A78BFA · #7DD3FC |
| `Mascote/neon-1…4` | só no Bento e no logotipo | #4FD1FF · #8B7BFF · #FF8FD0 · #FFC58A |

## Tipografia
| Estilo no Figma | Fonte | Uso |
|---|---|---|
| `Titulo/h1` | Playfair Display 500, 44px, altura 110%, espaçamento −2% | título da página |
| `Titulo/h2` | Playfair Display 500, 24px | títulos de painel |
| `Titulo/h3` | Playfair Display 500, 17,6px | títulos de card |
| `Texto/corpo` | DM Sans 400, 15px, altura 155% | texto e interface |
| `Rotulo/mono` | DM Mono 500, 11px, maiúsculas, espaçamento +14% | legendas, contadores |
| `Numero` | Playfair Display com números tabulares | números grandes do painel |

No código, os títulos usam `clamp()` e encolhem no celular; no Figma, crie uma variante "mobile" do h1 com 30px.

## Bento
O desenho é um SVG original em `src/app/shared/mascote.component.ts` (viewBox 200×200): corpo em formato de "mochi" com degradê de `#0B0F1F` a `#3B3F86`, contorno com degradê neon (ciano → violeta → rosa → pêssego) e brilho no chão.
Para levar ao Figma: abra o app, clique com o botão direito no mascote → *Inspecionar* → copie o `<svg>` e cole no Figma (Ctrl+V). Transforme cada pose em uma variante do componente **Bento** (propriedade `pose`).

## Componentes ↔ código
| Figma | Angular |
|---|---|
| Bento | `<app-mascote pose="...">` |
| Logotipo | `<app-marca>` |
| Anel | `<app-anel-progresso>` |
| Avatar de trilha | `<app-avatar-trilha>` |
| Ícone | `<app-icone nome="...">` |
| Folha | `<app-folha>` |
| Foco flutuante | `<app-foco-flutuante>` |
| Painel / Painel destaque | classes `.painel`, `.painel.destaque` |
| Botão | `.btn` + `.btn-primario` · `.btn-secundario` · `.btn-fantasma` · `.btn-perigo` · `.btn-icone`; tamanhos `.btn-sm` · `.btn-lg` |
| Campo | `.campo-grupo` + `.campo` (+ `.campo-dica`, `.campo-erro`) |
| Chip / Etiqueta / Segmentos | `.chip`, `.etiqueta`, `.segmentos` |
| Estado vazio | `.vazio` + Bento |

## Acessibilidade
Contrastes medidos com a fórmula do WCAG:
- Texto principal sobre o fundo: 17:1 no escuro e 16:1 no claro ✅.
- Texto suave sobre o fundo escuro: 6,2:1 ✅. No claro, sobre a superfície branca: 4,7:1 ✅.
- Azul-céu `#5B8DEF` sobre o fundo escuro (links, itálicos): 5,9:1 ✅.
- Botão primário no **tema claro** (branco sobre `#2F63D1`): 5,5:1 ✅.
- Botão primário no **tema escuro**: texto azul-noite sobre `#5B8DEF`, 5,9:1 ✅ (8,2:1 no hover). Branco ali daria só 3,2:1, por isso `sobre-acento` muda de cor entre os temas.
- Área de toque mínima de 44px nos campos e botões de ícone; botões padrão têm 42px de altura.
- Foco visível: contorno de 2px na cor de acento, afastado 3px.
- Animações respeitam `prefers-reduced-motion`.
