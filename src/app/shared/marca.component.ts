import { Component, input } from '@angular/core';

/** Logotipo: rosto do Bento (gatinho neon) + "Trilha" em serifa + "dev" em mono. */
@Component({
  selector: 'app-marca',
  template: `
    <svg class="cabeca" viewBox="0 0 64 60" width="30" height="28" aria-hidden="true">
      <defs><linearGradient id="marca-aro" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#4fd1ff"/><stop offset=".38" stop-color="#8b7bff"/><stop offset=".7" stop-color="#ff8fd0"/><stop offset="1" stop-color="#ffc58a"/></linearGradient></defs>
      <g stroke="url(#marca-aro)" stroke-width="2.6" stroke-linejoin="round" fill="#0e1430">
      <path d="M10 40 13 9c.5-4 4-5 7-3l14 12"/><path d="M54 40 51 9c-.5-4-4-5-7-3L30 18"/>
      <path d="M6 44c-2-20 10-32 26-32s28 12 26 32c-1 8-6 12-14 12H20c-8 0-13-4-14-12Z"/></g>
      <circle cx="24" cy="37" r="2.8" fill="#fff"/><circle cx="40" cy="37" r="2.8" fill="#fff"/>
      <path d="M28 43q2 2.5 4 0q2 2.5 4 0" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </svg>
    <span class="nome">Trilha</span>
    @if (completa()) {<span class="dev">dev</span>}
  `,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 9px; color: var(--texto); }
    .cabeca { flex: none; overflow: visible; filter: drop-shadow(0 0 4px rgb(139 123 255 / 45%)); }
    .nome { font-family: var(--serif); font-size: 1.35rem; font-weight: 600; letter-spacing: -.02em; line-height: 1; }
    .dev { align-self: flex-end; margin: 0 0 2px -3px; font-family: var(--mono); font-size: .6rem; letter-spacing: .18em; text-transform: uppercase; color: var(--acento); }
  `,
})
export class MarcaComponent {
  completa = input(true);
}
