import { Component, input, output } from '@angular/core';
import { IconeComponent } from './icone.component';

/** Painel de formulário: gaveta à direita no desktop, folha de baixo no celular. */
@Component({
  selector: 'app-folha',
  imports: [IconeComponent],
  host: { '(document:keydown.escape)': 'fechar.emit()' },
  template: `
    <div class="fundo" (click)="fechar.emit()"></div>
    <section class="folha" role="dialog" aria-modal="true" [attr.aria-label]="titulo()">
      <header>
        <div>
          @if (rotulo()) { <p class="rotulo-mono">{{ rotulo() }}</p> }
          <h2>{{ titulo() }}</h2>
        </div>
        <button class="btn-icone" type="button" (click)="fechar.emit()" aria-label="Fechar"><app-icone nome="fechar" [tamanho]="18" /></button>
      </header>
      <div class="corpo"><ng-content /></div>
    </section>
  `,
  styles: `
    :host { position: fixed; inset: 0; z-index: 80; display: flex; justify-content: flex-end; align-items: stretch; }
    .fundo { position: absolute; inset: 0; background: rgb(4 8 20 / 62%); backdrop-filter: blur(2px); animation: aparece .2s ease; }
    .folha {
      position: relative; display: flex; flex-direction: column;
      width: min(460px, 100%); height: 100%;
      background: var(--superficie); border-left: 1px solid var(--borda-forte); box-shadow: var(--sombra);
      animation: entraLado .35s var(--ease);
    }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 22px 24px 18px; border-bottom: 1px solid var(--borda); }
    header .rotulo-mono { margin-bottom: 6px; }
    .corpo { flex: 1; overflow-y: auto; padding: 22px 24px calc(28px + env(safe-area-inset-bottom)); }
    @keyframes entraLado { from { transform: translateX(40px); opacity: 0; } }
    @keyframes entraBaixo { from { transform: translateY(100%); } }
    @keyframes aparece { from { opacity: 0; } }
    @media (max-width: 767px) {
      :host { align-items: flex-end; }
      .folha { height: auto; max-height: 92dvh; width: 100%; border-left: 0; border-top: 1px solid var(--borda-forte); border-radius: 18px 18px 0 0; animation: entraBaixo .35s var(--ease); }
    }
  `,
})
export class FolhaComponent {
  titulo = input.required<string>();
  rotulo = input('');
  fechar = output<void>();
}
