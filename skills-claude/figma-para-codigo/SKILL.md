---
name: figma-para-codigo
description: Use quando a pessoa enviar um link ou print de um frame do Figma para implementar no Trilha Dev usando os design tokens existentes.
---
# Do Figma para o código

1. **Ler o design**: se houver Figma MCP conectado, buscar o frame pelo link (estrutura, Auto Layout, variables). Sem MCP, trabalhar a partir do print e perguntar medidas que não estiverem claras.
2. **Mapear tokens**: cada cor/espaço/raio do frame deve corresponder a um token de `design/tokens.json`. Variable do Figma `Cor/primaria` → `var(--cor-primaria)`. Se aparecer um valor que não existe, **parar e perguntar** se é um token novo (e então adicioná-lo em `tokens.json` E em `styles.scss`, nos dois temas).
3. **Auto Layout → CSS**: horizontal/vertical → `display:flex` + `flex-direction`; gap → `gap`; padding → `padding`; "Fill container" → `flex:1`/`width:100%`; "Hug" → largura automática; grids → `display:grid`.
4. **Componentes do Figma → Angular**: reaproveitar `.card`, `.btn`, `.chip`, `<app-barra-progresso>` antes de criar algo novo. Variants viram `input()` ou classes modificadoras.
5. **Implementar** seguindo a skill `criar-componente-angular`.
6. **Conferir**: comparar lado a lado com o frame em 1280px e 375px, nos temas claro e escuro.
