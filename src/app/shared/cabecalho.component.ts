import { Component, input } from '@angular/core';

/**
 * Cabeçalho editorial das páginas:
 *   01 — PAINEL
 *   Título em serifa (use <em> para o destaque em azul)
 *   subtítulo · ações à direita
 */
@Component({
  selector: 'app-cabecalho',
  template: `
    <div class="texto">
      @if (rotulo()) {
        <p class="rotulo-mono"><span class="acento">{{ numero() }}</span>@if (numero()) { — }{{ rotulo() }}</p>
      }
      <ng-content select="h1" />
      <ng-content select="p" />
    </div>
    <div class="acoes"><ng-content select="[acoes]" /></div>
  `,
  styles: `
    :host { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px 24px; margin: 0 0 clamp(20px, 3vw, 32px); }
    .texto { display: grid; gap: 10px; min-width: 0; max-width: 720px; }
    :host ::ng-deep .texto > p:not(.rotulo-mono) { color: var(--texto-suave); max-width: 560px; font-size: 1rem; }
    .acoes { display: flex; flex-wrap: wrap; gap: 8px; }
    .acoes:empty { display: none; }
  `,
})
export class CabecalhoComponent {
  numero = input('');
  rotulo = input('');
}
