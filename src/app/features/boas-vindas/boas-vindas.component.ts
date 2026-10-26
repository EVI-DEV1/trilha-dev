import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconeComponent } from '../../shared/icone.component';
import { MarcaComponent } from '../../shared/marca.component';
import { MascoteComponent } from '../../shared/mascote.component';

export const CHAVE_BOAS_VINDAS = 'trilha-dev:boas-vindas';

interface Passo {
  titulo: string;
  destaque: string;
  texto: string;
}

/** Apresentação em três passos, mostrada só no primeiro acesso. */
@Component({
  selector: 'app-boas-vindas',
  imports: [RouterLink, IconeComponent, MarcaComponent, MascoteComponent],
  template: `
    <header class="topo">
      <app-marca />
      <nav class="topo-links">
        <a class="link-texto" routerLink="/baixar">Baixar o app</a>
        <button class="link-texto" type="button" (click)="concluir()">Pular</button>
      </nav>
    </header>

    <main class="palco">
      <div class="arte" aria-hidden="true">
        <span class="halo"></span>
        @switch (passo()) {
          @case (0) { <app-mascote pose="acenando" [tamanho]="tamanhoBento" /> }
          @case (1) { <app-mascote pose="foco" [tamanho]="tamanhoBento" /> }
          @case (2) { <app-mascote pose="comemorando" [tamanho]="tamanhoBento" /> }
        }
      </div>

      <section class="texto" aria-live="polite">
        <p class="rotulo-mono"><span class="acento">0{{ passo() + 1 }}</span> / 0{{ passos.length }}</p>
        <h1>{{ atual().titulo }} <em>{{ atual().destaque }}</em></h1>
        <p class="sub">{{ atual().texto }}</p>
        <div class="controles">
          <div class="pontos" aria-hidden="true">
            @for (p of passos; track $index) { <span [class.ativo]="$index === passo()"></span> }
          </div>
          <div class="botoes">
            @if (passo() > 0) {
              <button class="btn btn-fantasma" type="button" (click)="passo.set(passo() - 1)">Voltar</button>
            }
            <button class="btn btn-primario btn-lg" type="button" (click)="avancar()">
              {{ ultimo() ? 'Começar agora' : 'Próximo' }} <app-icone nome="seta" [tamanho]="17" />
            </button>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: `
    :host { display: flex; flex-direction: column; min-height: 100dvh; padding: clamp(20px, 4vw, 48px); background: var(--brilho), var(--fundo); }
    .topo { display: flex; justify-content: space-between; align-items: center; }
    .topo-links { display: flex; gap: 18px; align-items: center; }
    .palco { flex: 1; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: clamp(24px, 6vw, 96px); max-width: 1180px; width: 100%; margin: 0 auto; }
    .arte { position: relative; display: grid; place-items: center; }
    .arte app-mascote { position: relative; animation: entra .6s var(--ease); }
    .halo { position: absolute; width: min(360px, 80%); aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, var(--acento-suave) 0, transparent 70%); border: 1px solid var(--borda); }
    .texto { display: grid; gap: 18px; max-width: 520px; animation: entra .6s var(--ease); }
    h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); line-height: 1.02; letter-spacing: -.04em; }
    .sub { color: var(--texto-2); font-size: 1.05rem; max-width: 440px; }
    .controles { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; margin-top: 18px; }
    .pontos { display: flex; gap: 6px; }
    .pontos span { width: 18px; height: 2px; background: var(--borda-forte); transition: width .3s, background .3s; }
    .pontos .ativo { width: 36px; background: var(--acento); }
    .botoes { display: flex; gap: 8px; }
    @keyframes entra { from { opacity: 0; transform: translateY(12px); } }
    @media (max-width: 860px) {
      .palco { grid-template-columns: 1fr; align-content: center; gap: 12px; }
      .halo { width: 220px; }
    }
  `,
})
export class BoasVindasComponent {
  private router = inject(Router);

  protected passos: Passo[] = [
    { titulo: 'Oi, eu sou o Bento! Vamos organizar seus estudos em', destaque: 'trilhas?', texto: 'Cursos, formações e matérias da faculdade em um só lugar, com o progresso de cada módulo sempre à vista.' },
    { titulo: 'Estude com', destaque: 'foco.', texto: 'Um timer Pomodoro ligado ao módulo que você está estudando. Ele continua rodando enquanto você navega.' },
    { titulo: 'Acompanhe sua', destaque: 'evolução.', texto: 'Meta semanal, sequência de dias e histórico salvos na nuvem, em qualquer aparelho.' },
  ];
  protected tamanhoBento = typeof window !== 'undefined' && window.innerWidth < 860 ? 170 : 300;
  protected passo = signal(0);
  protected atual = computed(() => this.passos[this.passo()]);
  protected ultimo = computed(() => this.passo() === this.passos.length - 1);

  avancar(): void {
    if (this.ultimo()) this.concluir();
    else this.passo.update((p) => p + 1);
  }

  concluir(): void {
    try {
      localStorage.setItem(CHAVE_BOAS_VINDAS, '1');
    } catch {
      /* sem armazenamento */
    }
    this.router.navigateByUrl('/');
  }
}
