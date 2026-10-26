import { Component } from '@angular/core';
import { MarcaComponent } from './marca.component';
import { MascoteComponent } from './mascote.component';

/** Layout das telas de acesso: painel editorial à esquerda e conteúdo à direita. */
@Component({
  selector: 'app-tela-dividida',
  imports: [MarcaComponent, MascoteComponent],
  template: `
    <aside class="arte" aria-hidden="true">
      <app-marca />
      <div class="arte-texto">
        <p class="rotulo-mono acento">Planner de estudos para devs</p>
        <p class="frase">Estude com <em>direção</em>,<br />não com pressa.</p>
        <ul>
          <li><span>01</span> Trilhas e módulos com progresso real</li>
          <li><span>02</span> Foco no método Pomodoro, ligado ao que você estuda</li>
          <li><span>03</span> Metas, sequência de dias e histórico na nuvem</li>
        </ul>
      </div>
      <app-mascote class="bento" pose="acenando" [tamanho]="230" />
      <p class="rodape rotulo-mono">Trilha · feito por Eliane Vitoriano</p>
    </aside>
    <main class="lado"><div class="miolo"><ng-content /></div></main>
  `,
  styles: `
    :host { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); min-height: 100dvh; background: var(--fundo); }
    .arte {
      position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
      padding: clamp(28px, 4vw, 56px);
      background: radial-gradient(circle at 80% 18%, #2a4fa8 0, #142347 38%, #0a1020 75%);
      color: #eef3ff; border-right: 1px solid rgb(170 195 255 / 12%);
    }
    .arte app-marca { color: #eef3ff; }
    .bento { position: absolute; right: clamp(16px, 4vw, 56px); bottom: 64px; z-index: 0; opacity: .97; }
    .arte-texto { position: relative; z-index: 1; display: grid; gap: 22px; max-width: 460px; }
    .frase { font-family: var(--serif); font-size: clamp(2.4rem, 4.6vw, 4rem); line-height: 1.02; letter-spacing: -.04em; }
    .frase em { color: #84aaf5; }
    ul { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 14px; color: #b9c4dc; }
    li { display: grid; grid-template-columns: 34px 1fr; gap: 8px; padding-bottom: 14px; border-bottom: 1px solid rgb(170 195 255 / 14%); }
    li span { font-family: var(--mono); font-size: .7rem; color: #84aaf5; padding-top: 3px; }
    .rodape { position: relative; z-index: 1; color: #8794b0; }
        .lado { display: grid; place-items: center; padding: clamp(24px, 5vw, 64px) 20px; }
    .miolo { width: min(420px, 100%); }
    @media (max-width: 899px) {
      :host { grid-template-columns: 1fr; }
      .arte { min-height: auto; padding: 22px 20px 26px; gap: 18px; }
      .arte ul, .rodape { display: none; }
      .bento { width: 92px; right: 16px; bottom: auto; top: 10px; }
      .bento ::ng-deep svg { width: 92px; height: auto; }
      .frase { font-size: 2rem; }
      .lado { place-items: start center; padding-top: 28px; }
    }
  `,
})
export class TelaDivididaComponent {}
