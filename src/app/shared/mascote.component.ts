import { Component, computed, input } from '@angular/core';

export type PoseMascote = 'acenando' | 'lendo' | 'foco' | 'comemorando' | 'pensando';

let sequencia = 0;

/**
 * Bento, o gatinho-mascote da Trilha. Desenho original em SVG:
 * corpo escuro em formato de "mochi", contorno neon iridescente e brilho no chão.
 */
@Component({
  selector: 'app-mascote',
  template: `
    <svg [attr.width]="tamanho()" [attr.height]="tamanho()" viewBox="0 0 200 200" role="img" [attr.aria-label]="rotulo()">
      <defs>
        <linearGradient [attr.id]="id + 'aro'" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#4fd1ff" />
          <stop offset=".38" stop-color="#8b7bff" />
          <stop offset=".7" stop-color="#ff8fd0" />
          <stop offset="1" stop-color="#ffc58a" />
        </linearGradient>
        <linearGradient [attr.id]="id + 'corpo'" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0b0f1f" />
          <stop offset=".62" stop-color="#121a36" />
          <stop offset="1" stop-color="#3b3f86" />
        </linearGradient>
        <radialGradient [attr.id]="id + 'chao'">
          <stop offset="0" stop-color="#9fb8ff" stop-opacity=".9" />
          <stop offset="1" stop-color="#9fb8ff" stop-opacity="0" />
        </radialGradient>
        <filter [attr.id]="id + 'brilho'" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- brilho no chão -->
      <ellipse cx="100" cy="174" rx="78" ry="5" [attr.fill]="url('chao')" />

      <g [attr.filter]="url('brilho', true)" [attr.stroke]="url('aro')" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
        <!-- rabo -->
        <path d="M152 166c20 2 34-10 32-28-1-9-9-13-14-8" fill="none" stroke-width="7.5" />
        <path d="M152 166c20 2 34-10 32-28-1-9-9-13-14-8" fill="none" stroke="#0e1430" stroke-width="3.6" />

        <!-- orelhas -->
        <path d="M50 104 56 58c1-5 6-7 10-4l26 22" [attr.fill]="url('corpo')" />
        <path d="M150 104 144 58c-1-5-6-7-10-4l-26 22" [attr.fill]="url('corpo')" />

        <!-- corpo "mochi" -->
        <path d="M36 146c-4-44 22-76 64-76s68 32 64 76c-1 16-12 26-28 26H64c-16 0-27-10-28-26Z" [attr.fill]="url('corpo')" />

        <!-- patinhas / acessórios -->
        @switch (pose()) {
          @case ('acenando') {
            <g class="aceno"><ellipse cx="160" cy="106" rx="11" ry="12" [attr.fill]="url('corpo')" /></g>
          }
          @case ('lendo') {
            <path d="M70 150l30 6 30-6v20l-30 6-30-6Z" fill="#0e1430" />
            <path d="M100 156v20" />
            <ellipse cx="72" cy="160" rx="8" ry="7" [attr.fill]="url('corpo')" />
            <ellipse cx="128" cy="160" rx="8" ry="7" [attr.fill]="url('corpo')" />
          }
          @case ('foco') {
            <circle cx="100" cy="156" r="16" fill="#0e1430" />
            <path d="M100 156v-9M100 156l6 4" stroke-width="2.2" />
            <path d="M95 136h10" stroke-width="3" />
            <ellipse cx="80" cy="162" rx="8" ry="7" [attr.fill]="url('corpo')" />
            <ellipse cx="120" cy="162" rx="8" ry="7" [attr.fill]="url('corpo')" />
          }
          @case ('comemorando') {
            <ellipse cx="38" cy="112" rx="10" ry="11" [attr.fill]="url('corpo')" />
            <ellipse cx="162" cy="112" rx="10" ry="11" [attr.fill]="url('corpo')" />
            <path d="M26 72l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="#ffc58a" stroke="none" />
            <path d="M172 60l2.5 5.5 6 .8-4.4 4.2 1 6-5.1-2.8-5.1 2.8 1-6-4.4-4.2 6-.8Z" fill="#8b7bff" stroke="none" />
            <circle cx="182" cy="96" r="3.5" fill="#4fd1ff" stroke="none" />
            <circle cx="18" cy="48" r="3" fill="#ff8fd0" stroke="none" />
          }
          @case ('pensando') {
            <circle cx="158" cy="52" r="5" fill="none" stroke-width="2" />
            <circle cx="172" cy="34" r="8" fill="none" stroke-width="2" />
          }
        }
      </g>

      <!-- interior das orelhas -->
      <path d="M60 92 64 66l16 14Z" fill="#ff8fd0" opacity=".28" />
      <path d="M140 92 136 66l-16 14Z" fill="#ff8fd0" opacity=".28" />

      <!-- rosto -->
      <g [attr.filter]="url('brilho', true)" fill="#ffffff" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round">
        @if (pose() === 'comemorando') {
          <path d="M72 116q8-9 16 0M112 116q8-9 16 0" fill="none" stroke-width="3.2" />
        } @else if (pose() === 'lendo' || pose() === 'foco') {
          <path d="M72 118q8 5 16 0M112 118q8 5 16 0" fill="none" stroke-width="3.2" />
        } @else if (pose() === 'pensando') {
          <circle cx="84" cy="112" r="5.2" stroke="none" /><circle cx="124" cy="112" r="5.2" stroke="none" />
        } @else {
          <circle cx="80" cy="116" r="5.4" stroke="none" /><circle cx="120" cy="116" r="5.4" stroke="none" />
        }
        @if (pose() === 'comemorando') {
          <path d="M93 126q7 9 14 0Z" stroke-width="1.6" />
        } @else {
          <path d="M93 126q3.5 4 7 0q3.5 4 7 0" fill="none" stroke-width="2" />
        }
      </g>

      <!-- bigodes -->
      <g stroke="#dfe8ff" stroke-width="1.2" stroke-linecap="round" opacity=".55">
        <path d="M44 120l-22-4M44 127l-21 3M156 120l22-4M156 127l21 3" />
      </g>
    </svg>
  `,
  styles: `
    :host { display: inline-block; line-height: 0; }
    .aceno { transform-origin: 152px 120px; animation: acena 2.6s ease-in-out infinite; }
    @keyframes acena { 0%, 55%, 100% { transform: rotate(0); } 65% { transform: rotate(-14deg); } 75% { transform: rotate(8deg); } 85% { transform: rotate(-8deg); } }
    svg { overflow: visible; }
    @media (prefers-reduced-motion: reduce) { .aceno { animation: none; } }
  `,
})
export class MascoteComponent {
  pose = input<PoseMascote>('acenando');
  tamanho = input(160);

  /** Ids únicos para os gradientes (vários mascotes na mesma página). */
  protected id = `bento${++sequencia}-`;
  protected rotulo = computed(() => `Bento, o gatinho mascote da Trilha, ${this.pose()}`);

  protected url(nome: string, _filtro = false): string {
    return `url(#${this.id}${nome})`;
  }
}
