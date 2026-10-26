import { Component, input } from '@angular/core';
import { MascoteComponent } from './mascote.component';

const CORES = ['#5B8DEF', '#84AAF5', '#4FC3A1', '#F2B45A', '#E9798A', '#EEF3FF'];

/** Chuva de confete em CSS puro + cartão com a mensagem. */
@Component({
  selector: 'app-confete',
  imports: [MascoteComponent],
  template: `
    <div class="chuva" aria-hidden="true">
      @for (p of pedacos; track $index) {
        <i [style.left.%]="p.x" [style.background]="p.cor" [style.width.px]="p.w" [style.height.px]="p.h"
          [style.animation-delay.ms]="p.atraso" [style.animation-duration.ms]="p.duracao" [style.--giro]="p.giro + 'deg'"></i>
      }
    </div>
    <div class="cartao-festa" role="status">
      <app-mascote pose="comemorando" [tamanho]="130" />
      <span class="rotulo-mono acento">Trilha concluída</span>
      <strong>{{ mensagem() }}</strong>
      <span>Mandou bem! Bora para a próxima.</span>
    </div>
  `,
  styles: `
    :host { position: fixed; inset: 0; z-index: 60; pointer-events: none; display: grid; place-items: center; }
    .chuva { position: absolute; inset: 0; overflow: hidden; }
    i { position: absolute; top: -20px; border-radius: 3px; opacity: 0; animation: cai linear forwards; }
    @keyframes cai {
      0% { opacity: 1; transform: translateY(0) rotate(0); }
      100% { opacity: .9; transform: translateY(105vh) rotate(var(--giro)); }
    }
    .cartao-festa {
      display: grid; justify-items: center; gap: 4px; text-align: center; max-width: 300px;
      padding: 26px 30px; border-radius: var(--r-assinatura); background: var(--superficie); color: var(--texto);
      border: 1px solid var(--borda-forte); box-shadow: var(--sombra);
      animation: pula .5s cubic-bezier(.2, 1.4, .4, 1);
    }
    
    strong { font-family: var(--serif); font-weight: 500; font-size: 1.3rem; }
    .cartao-festa span:last-child { font-size: .85rem; color: var(--texto-suave); }
    @keyframes pula { from { transform: scale(.6); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .chuva { display: none; } .cartao-festa { animation: none; } }
  `,
})
export class ConfeteComponent {
  mensagem = input.required<string>();

  protected pedacos = Array.from({ length: 70 }, () => ({
    x: Math.random() * 100,
    cor: CORES[Math.floor(Math.random() * CORES.length)],
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 10,
    atraso: Math.random() * 600,
    duracao: 1800 + Math.random() * 1400,
    giro: 200 + Math.random() * 520,
  }));
}
