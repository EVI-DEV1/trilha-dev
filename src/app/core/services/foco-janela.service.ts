import { Injectable, Injector, effect, inject, signal } from '@angular/core';
import { RABO_BENTO, SILHUETA_BENTO, anguloRabo } from '../../shared/relogio-bento.component';
import { FocoService } from './foco.service';

interface DocumentPictureInPicture {
  requestWindow(opcoes: { width: number; height: number }): Promise<Window>;
  window: Window | null;
}

/**
 * Destaca o timer do Bento numa janelinha que fica por cima de tudo
 * (outras abas, sites e apps), usando a Document Picture-in-Picture API.
 * Disponível no Chrome e no Edge para computador.
 */
@Injectable({ providedIn: 'root' })
export class FocoJanelaService {
  private foco = inject(FocoService);
  private injector = inject(Injector);

  readonly suportado = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
  readonly aberta = signal(false);

  private static readonly GRANDE = { width: 240, height: 300 };
  private static readonly COMPACTA = { width: 236, height: 92 };

  /** Abre a janela; `compacta` começa só com o Bento e o tempo, numa faixa pequena. */
  async abrir(compacta = false): Promise<void> {
    if (!this.suportado || this.aberta()) return;
    const api = (window as unknown as { documentPictureInPicture: DocumentPictureInPicture }).documentPictureInPicture;
    const janela = await api.requestWindow(compacta ? FocoJanelaService.COMPACTA : FocoJanelaService.GRANDE);
    this.montar(janela.document);
    this.aberta.set(true);

    const atualizar = effect(() => this.desenhar(janela.document), { injector: this.injector });
    janela.addEventListener('resize', () => this.desenhar(janela.document));
    janela.addEventListener('pagehide', () => {
      atualizar.destroy();
      this.aberta.set(false);
    });
  }

  private montar(doc: Document): void {
    doc.title = 'Bento · Foco';
    doc.head.innerHTML = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Playfair+Display:wght@500&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at 50% 90%, #22306a, #0a1020 70%); color: #eef3ff; font-family: 'DM Mono', monospace; overflow: hidden; }
        .caixa { position: relative; display: grid; justify-items: center; gap: 4px; padding: 10px; text-align: center; }
        .gato { width: min(170px, 62vw); height: auto; overflow: visible; }
        .acoes { display: flex; gap: 8px; margin-top: 6px; }
        .tamanho { background: transparent; border: 1px solid rgb(170 195 255 / 25%); color: #b9c4dc; }
        /* Janela baixa ou estreita: vira uma faixa horizontal (Bento + tempo + botões) */
        @media (max-height: 180px), (max-width: 170px) {
          .caixa { grid-template-columns: auto 1fr auto; grid-template-areas: 'gato fase acoes' 'gato tempo acoes'; align-items: center; justify-items: start; gap: 0 10px; padding: 6px 10px; width: 100%; text-align: left; }
          .gato { grid-area: gato; width: 64px; }
          .fase { grid-area: fase; align-self: end; font-size: 9px; }
          .tempo { grid-area: tempo; align-self: start; font-size: 28px; }
          .modulo { display: none; }
          .acoes { grid-area: acoes; margin: 0; gap: 6px; }
          button { width: 32px !important; height: 32px !important; margin: 0 !important; }
        }
        @media (max-height: 70px) { .gato { width: 44px; } .tempo { font-size: 22px; } .fase { display: none; } }
        .fase { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #84aaf5; }
        .fase.pausa { color: #4fc3a1; }
        .tempo { font-family: 'Playfair Display', Georgia, serif; font-size: 40px; line-height: 1; font-variant-numeric: tabular-nums; }
        .modulo { max-width: 200px; font-size: 10px; color: #8794b0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        button { width: 40px; height: 40px; border-radius: 50%; border: 0; background: #5b8def; color: #fff; cursor: pointer; display: grid; place-items: center; }
        .pista { stroke: #22304f; }
        .rabo { transform-box: view-box; transform-origin: 156px 152px; transition: transform .9s linear; }
        .progresso { transition: stroke-dasharray .9s linear; }
      </style>`;
    doc.body.innerHTML = `
      <div class="caixa">
        <svg class="gato" viewBox="22 30 196 156" aria-hidden="true">
          <defs>
            <linearGradient id="neon" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stop-color="#4fd1ff"/><stop offset=".38" stop-color="#8b7bff"/><stop offset=".7" stop-color="#ff8fd0"/><stop offset="1" stop-color="#ffc58a"/>
            </linearGradient>
            <filter id="brilho" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g class="rabo"><path d="${RABO_BENTO}" fill="none" stroke="url(#neon)" stroke-width="7" stroke-linecap="round" filter="url(#brilho)"/><path d="${RABO_BENTO}" fill="none" stroke="#0a1020" stroke-width="3.2" stroke-linecap="round"/></g>
          <path d="${SILHUETA_BENTO}" fill="#0e1430"/>
          <path class="pista" d="${SILHUETA_BENTO}" pathLength="100" fill="none" stroke-width="3.2"/>
          <path class="progresso" d="${SILHUETA_BENTO}" pathLength="100" fill="none" stroke="url(#neon)" stroke-width="3.6" stroke-linecap="round" filter="url(#brilho)"/>
          <g class="olhos" fill="#fff"></g>
        </svg>
        <span class="fase"></span>
        <span class="tempo"></span>
        <span class="modulo"></span>
        <div class="acoes">
          <button type="button" class="play" aria-label="Pausar ou retomar"></button>
          <button type="button" class="tamanho" aria-label="Recolher ou expandir"></button>
        </div>
      </div>`;
    doc.querySelector('.play')!.addEventListener('click', () => this.foco.alternar());
    // Recolher/expandir: a janela muda de tamanho (precisa do clique do usuário).
    doc.querySelector('.tamanho')!.addEventListener('click', () => {
      const janela = doc.defaultView;
      if (!janela) return;
      const compacta = janela.innerHeight <= 180;
      const alvo = compacta ? FocoJanelaService.GRANDE : FocoJanelaService.COMPACTA;
      try {
        janela.resizeTo(alvo.width, alvo.height);
      } catch {
        /* o navegador pode recusar; a pessoa ainda pode arrastar a borda da janela */
      }
    });
  }

  private desenhar(doc: Document): void {
    const pct = Math.min(100, Math.max(0, this.foco.percentual()));
    const pausa = this.foco.fase() === 'pausa';
    const cor = pausa ? '#4fc3a1' : 'url(#neon)';
    const progresso = doc.querySelector<SVGPathElement>('.progresso');
    progresso?.setAttribute('stroke-dasharray', `${pct} 100`);
    progresso?.setAttribute('stroke', cor);
    doc.querySelector<SVGGElement>('.rabo')?.setAttribute('style', `transform: rotate(${anguloRabo(pct)}deg)`);
    doc.querySelector<SVGPathElement>('.rabo path')?.setAttribute('stroke', cor);
    const olhos = doc.querySelector('.olhos');
    if (olhos) {
      olhos.innerHTML = this.foco.rodando()
        ? '<path d="M80 98q6 4 12 0M108 98q6 4 12 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>'
        : '<circle cx="86" cy="97" r="3.6"/><circle cx="114" cy="97" r="3.6"/>';
    }
    const fase = doc.querySelector('.fase');
    if (fase) {
      fase.textContent = pausa ? 'Pausa' : 'Foco';
      fase.className = 'fase' + (pausa ? ' pausa' : '');
    }
    const tempo = doc.querySelector('.tempo');
    if (tempo) tempo.textContent = this.foco.tempo();
    const modulo = doc.querySelector('.modulo');
    if (modulo) modulo.textContent = this.foco.alvo()?.modulo ?? 'Sessão livre';
    const tamanho = doc.querySelector('.tamanho');
    if (tamanho) {
      const compacta = (doc.defaultView?.innerHeight ?? 300) <= 180;
      tamanho.innerHTML = compacta
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>';
    }
    const botao = doc.querySelector('.play');
    if (botao) {
      botao.innerHTML = this.foco.rodando()
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 5.5v13M15 5.5v13"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5L8 5.5Z"/></svg>';
    }
  }
}
