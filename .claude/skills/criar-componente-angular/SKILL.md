---
name: criar-componente-angular
description: Use ao criar uma página ou componente novo no Trilha Dev (Angular 19 standalone, signals, tokens de design, textos em pt-BR).
---
# Criar componente Angular no Trilha Dev

## 1. Decidir onde fica
- Página com rota → `src/app/features/<nome>/<nome>.component.ts`
- Peça reutilizável → `src/app/shared/<nome>.component.ts`

## 2. Escrever o componente
- `standalone` (padrão no Angular 19 — não declarar `standalone: true`), `selector: 'app-<nome>'`.
- Entradas com `input()` / `input.required()`, saídas com `output()`.
- Estado local com `signal`; derivados com `computed`.
- Dependências com `inject()`; dados vêm de `core/services/`, nunca `HttpClient` no componente.
- Template com `@if`, `@for (x of lista(); track x.id)`, `@empty`.
- Estilos usando só variáveis de `src/styles.scss` (`--fundo`, `--superficie*`, `--texto*`, `--acento*`, `--borda*`, `--r-*`) e classes globais (`.painel`, `.btn`, `.chip`, `.campo`, `.grade-auto`).
- Acessibilidade: `aria-label` em botões só com ícone, `alt` em imagens, foco visível.

Modelo:
```ts
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-exemplo',
  template: `<section class="painel"><h2>{{ titulo() }}</h2></section>`,
  styles: `h2 { margin: 0; }`,
})
export class ExemploComponent {
  titulo = input.required<string>();
}
```

## 3. Se for página
Adicionar em `app.routes.ts` com `loadComponent` e `title`, e no array `menu` do `app.component.ts` se precisar aparecer na navegação.

## 4. Checklist
- [ ] Textos em português · [ ] sem cores soltas · [ ] funciona em 360px · [ ] `npm run build` sem erros
