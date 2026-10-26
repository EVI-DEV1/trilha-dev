# 5. Design no Figma — design system "Tinta"

## Conceito
Visual de **app mobile**, com personalidade editorial:
- **Tinta** (azul-marinho quase preto) para cabeçalhos, navegação e contornos.
- **Creme** como fundo e **pêssego** como cor de ação e destaque.
- O cabeçalho de cada tela termina numa **borda "derretendo"** (forma orgânica em SVG). É a assinatura visual do app.
- Tudo é **pílula ou círculo**: chips, campos, itens de lista, botões, avatares.
- Contorno de **1,5px em tinta** nos elementos interativos, como um traço de ilustração.
- Progresso sempre em **anéis** (avatar da trilha, painel, timer).

No desktop, o app aparece dentro de um "aparelho" com cantos de 44px sobre um fundo de tinta.

## Estrutura do arquivo
1. **🎨 Fundamentos**: cores, tipografia, raios, traço, a forma "pingo" do cabeçalho.
2. **🧩 Componentes**: Topo (com pingo), Barra de navegação, Chip (padrão, ativo, mini, claro), Botão (primário, escuro, contorno, perigo, redondo, FAB), Campo, Anel de progresso, Avatar de trilha, Item de lista em pílula, Tarefa (padrão e destaque), Folha (bottom sheet).
3. **📱 Telas** (375×812): Início, Trilhas, Nova trilha (folha aberta), Detalhe da trilha, Foco (rodando e pausado), GitHub.
4. **🔀 Protótipo**: Início → tocar numa tarefa → Detalhe; Trilhas → FAB → Folha → Detalhe.
5. **🗒️ Handoff**.

## Tokens
A fonte única de verdade é `design/tokens.json`. Importe com o plugin **Tokens Studio** (*Load from file*) ou crie **Variables**:

| Figma (Variable) | CSS em `src/styles.scss` |
|---|---|
| `Cor/tinta` | `var(--tinta)` |
| `Cor/creme` | `var(--creme)` |
| `Cor/pessego` | `var(--pessego)` |
| `Cor/pessego-suave` | `var(--pessego-suave)` |
| `Raio/pilula` | `var(--pilula)` |
| `Borda/traco` | `var(--traco)` |
| `Tipografia/h1` | `h1` (Unbounded 600) |

Cores das trilhas (o usuário escolhe ao criar): `cor-trilha/t1…t6`.

## Tipografia
- **Unbounded** (títulos, números grandes): geométrica e larga, dá o ar de "app de marca".
- **Manrope** (texto e interface): muito legível em tamanhos pequenos.
- **JetBrains Mono** (timer): números de largura fixa, para o relógio não "pular".

## A forma "pingo"
Path do SVG em `src/app/shared/topo.component.ts` (viewBox 400×58). No Figma: desenhe com a Pen tool por cima de um retângulo de tinta, una com *Union* e transforme em componente. Use variações do mesmo pingo para não ficar repetitivo.

## Componentes ↔ código
| Figma | Angular |
|---|---|
| Topo | `<app-topo>` |
| Anel | `<app-anel-progresso>` |
| Avatar de trilha | `<app-avatar-trilha>` |
| Ícone | `<app-icone nome="...">` |
| Folha | `<app-folha>` |
| Chip / Botão / Campo | classes `.chip`, `.btn`, `.btn-redondo`, `.campo` |

## Acessibilidade
- Pêssego (#FFB98C) com texto em tinta: contraste ≈ 10:1 ✅. Nunca use texto branco sobre pêssego.
- Área de toque mínima de 44px (todos os botões redondos seguem isso).
- Foco visível: contorno pêssego-forte de 3px.
