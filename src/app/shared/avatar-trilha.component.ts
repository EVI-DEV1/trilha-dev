import { Component, computed, input } from '@angular/core';
import { Trilha, progressoDe } from '../core/models/trilha.model';
import { AnelProgressoComponent } from './anel-progresso.component';

/** Monograma da trilha dentro de um anel com o progresso dela. */
@Component({
  selector: 'app-avatar-trilha',
  imports: [AnelProgressoComponent],
  template: `
    <app-anel-progresso [valor]="progresso()" [tamanho]="tamanho()" [espessura]="espessura()" [cor]="trilha().cor"
      [trilho]="trilho()" [rotulo]="'Progresso de ' + trilha().titulo">
      <span class="mono" [style.width.px]="interno()" [style.height.px]="interno()" [style.font-size.px]="interno() * 0.32">
        {{ monograma() }}
      </span>
    </app-anel-progresso>
  `,
  styles: `
    .mono {
      display: grid; place-items: center; border-radius: 50%;
      background: var(--superficie-2); color: var(--texto); border: 1px solid var(--borda);
      font-family: var(--serif); font-style: italic; font-weight: 500; letter-spacing: .01em;
    }
  `,
})
export class AvatarTrilhaComponent {
  trilha = input.required<Trilha>();
  tamanho = input(64);
  trilho = input('var(--superficie-3)');

  protected espessura = computed(() => Math.max(3, Math.round(this.tamanho() / 18)));
  protected interno = computed(() => this.tamanho() - this.espessura() * 2 - 6);
  protected progresso = computed(() => progressoDe(this.trilha()));
  protected monograma = computed(() => {
    const palavras = this.trilha().titulo.replace(/[()]/g, '').split(/\s+/).filter((p) => p.length > 2);
    return (palavras.slice(0, 2).map((p) => p[0]).join('') || '?').toUpperCase();
  });
}
