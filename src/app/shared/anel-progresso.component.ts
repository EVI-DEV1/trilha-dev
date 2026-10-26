import { Component, computed, input } from '@angular/core';

/** Anel de progresso em SVG com conteúdo livre no centro. */
@Component({
  selector: 'app-anel-progresso',
  template: `
    <svg [attr.width]="tamanho()" [attr.height]="tamanho()" [attr.viewBox]="'0 0 ' + tamanho() + ' ' + tamanho()"
      role="progressbar" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="valor()" [attr.aria-label]="rotulo()">
      <circle [attr.cx]="c()" [attr.cy]="c()" [attr.r]="r()" fill="none" [attr.stroke]="trilho()" [attr.stroke-width]="espessura()" />
      <circle class="arco" [attr.cx]="c()" [attr.cy]="c()" [attr.r]="r()" fill="none" [attr.stroke]="cor()"
        [attr.stroke-width]="espessura()" stroke-linecap="round" [attr.stroke-dasharray]="circunferencia()"
        [attr.stroke-dashoffset]="deslocamento()" [attr.transform]="'rotate(-90 ' + c() + ' ' + c() + ')'" />
    </svg>
    <div class="centro"><ng-content /></div>
  `,
  styles: `
    :host { position: relative; display: inline-grid; place-items: center; flex: none; }
    .arco { transition: stroke-dashoffset .6s cubic-bezier(.3, .8, .3, 1); }
    .centro { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
  `,
})
export class AnelProgressoComponent {
  valor = input.required<number>();
  tamanho = input(64);
  espessura = input(6);
  cor = input('var(--acento)');
  trilho = input('var(--superficie-3)');
  rotulo = input('Progresso');

  protected c = computed(() => this.tamanho() / 2);
  protected r = computed(() => (this.tamanho() - this.espessura()) / 2);
  protected circunferencia = computed(() => 2 * Math.PI * this.r());
  protected deslocamento = computed(() => {
    const v = Math.min(100, Math.max(0, this.valor()));
    // Evita um "pontinho" do arco quando o valor é 0
    return v === 0 ? this.circunferencia() + 1 : this.circunferencia() * (1 - v / 100);
  });
}
