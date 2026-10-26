import { Component, computed, input } from '@angular/core';

/** Contorno do gatinho, começando no topo da cabeça e seguindo no sentido horário. */
export const SILHUETA_BENTO =
  'M100 70C104 70 108 71 112 72L134 54C138 51 143 53 144 58L150 96C160 106 166 124 164 146C164 162 152 172 136 172H64C48 172 36 162 36 146C34 124 40 106 50 96L56 58C57 53 62 51 66 54L88 72C92 71 96 70 100 70Z';

/** Rabinho desenhado "apontando para cima" a partir do pivô (156,152). */
export const RABO_BENTO = 'M156 152C159 140 168 130 165 116C163 108 155 107 154 113';

/** Ponteiro: 0% aponta para baixo (170°) e 100% para cima (20°). */
export function anguloRabo(percentual: number): number {
  return 170 - Math.min(100, Math.max(0, percentual)) * 1.5;
}

/**
 * Timer em forma do Bento: o contorno do gatinho é a "pista" do tempo
 * (vai acendendo em neon a partir do topo) e o rabinho é o ponteiro,
 * que sobe de baixo para cima conforme a sessão avança.
 */
@Component({
  selector: 'app-relogio-bento',
  template: `
    <svg viewBox="22 30 196 156" role="progressbar" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="valor()" aria-label="Tempo decorrido da sessão">
      <defs>
        <linearGradient id="relogio-neon" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#4fd1ff" />
          <stop offset=".38" stop-color="#8b7bff" />
          <stop offset=".7" stop-color="#ff8fd0" />
          <stop offset="1" stop-color="#ffc58a" />
        </linearGradient>
        <linearGradient id="relogio-corpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0b0f1f" stop-opacity=".0" />
          <stop offset="1" stop-color="#3b3f86" stop-opacity=".35" />
        </linearGradient>
        <filter id="relogio-brilho" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <!-- marcações do ponteiro (arco à direita) -->
      @for (m of marcas; track m.angulo) {
        <circle [attr.cx]="m.x" [attr.cy]="m.y" r="1.6" class="marca" [class.passou]="m.angulo >= angulo()" />
      }

      <!-- rabinho = ponteiro -->
      <g class="rabo" [style.transform]="'rotate(' + angulo() + 'deg)'">
        <path [attr.d]="rabo" fill="none" [attr.stroke]="corTraco()" stroke-width="7" stroke-linecap="round" filter="url(#relogio-brilho)" />
        <path [attr.d]="rabo" fill="none" stroke="var(--fundo)" stroke-width="3.2" stroke-linecap="round" />
      </g>

      <!-- silhueta: preenchimento suave, pista e progresso -->
      <path [attr.d]="silhueta" fill="url(#relogio-corpo)" />
      <path [attr.d]="silhueta" pathLength="100" fill="none" class="pista" stroke-width="3.2" stroke-linejoin="round" />
      <path [attr.d]="silhueta" pathLength="100" fill="none" [attr.stroke]="corTraco()" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"
        class="progresso" [attr.stroke-dasharray]="valorLimitado() + ' 100'" filter="url(#relogio-brilho)" />

      <!-- rosto -->
      <g fill="#ffffff" stroke="#ffffff" stroke-linecap="round" filter="url(#relogio-brilho)" class="rosto">
        @if (rodando()) {
          <path d="M80 98q6 4 12 0M108 98q6 4 12 0" fill="none" stroke-width="2.6" />
        } @else {
          <circle cx="86" cy="97" r="3.6" stroke="none" /><circle cx="114" cy="97" r="3.6" stroke="none" />
        }
        <path d="M95 104q2.5 3 5 0q2.5 3 5 0" fill="none" stroke-width="1.6" />
      </g>
      <g stroke="currentColor" stroke-width="1" stroke-linecap="round" class="bigodes">
        <path d="M44 102l-16-3M44 108l-15 2M156 102l16-3M156 108l15 2" />
      </g>
    </svg>
    <div class="centro"><ng-content /></div>
  `,
  styles: `
    :host { position: relative; display: block; width: min(100%, 380px); color: var(--texto-suave); }
    svg { display: block; width: 100%; height: auto; overflow: visible; }
    .pista { stroke: var(--superficie-3); }
    .progresso { transition: stroke-dasharray .9s linear; }
    .rabo { transform-box: view-box; transform-origin: 156px 152px; transition: transform .9s linear; }
    .marca { fill: var(--superficie-3); transition: fill .4s; }
    .marca.passou { fill: var(--acento); }
    .bigodes { opacity: .35; }
    .centro {
      position: absolute; left: 39.8%; top: 66%; transform: translate(-50%, -50%);
      display: grid; justify-items: center; gap: 2px; width: 62%; text-align: center;
    }
    @media (prefers-reduced-motion: reduce) { .progresso, .rabo { transition: none; } }
  `,
})
export class RelogioBentoComponent {
  /** Percentual decorrido (0–100). */
  valor = input.required<number>();
  rodando = input(false);
  pausa = input(false);

  protected silhueta = SILHUETA_BENTO;
  protected rabo = RABO_BENTO;

  protected angulo = computed(() => anguloRabo(this.valorLimitado()));
  protected valorLimitado = computed(() => Math.min(100, Math.max(0, this.valor())));
  protected corTraco = computed(() => (this.pausa() ? 'var(--sucesso)' : 'url(#relogio-neon)'));

  protected marcas = Array.from({ length: 11 }, (_, i) => {
    const angulo = 170 - i * 15;
    const rad = (angulo * Math.PI) / 180;
    return { angulo, x: 156 + 48 * Math.sin(rad), y: 152 - 48 * Math.cos(rad) };
  });
}
