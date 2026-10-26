import { Component, ElementRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FocoJanelaService } from '../core/services/foco-janela.service';
import { FocoService } from '../core/services/foco.service';
import { IconeComponent } from './icone.component';
import { RelogioBentoComponent } from './relogio-bento.component';

interface Posicao {
  x: number;
  y: number;
}

const CHAVE_POSICAO = 'trilha-dev:bento-flutuante';
const CHAVE_COMPACTO = 'trilha-dev:bento-compacto';

/**
 * Bento flutuante: mini-timer que fica por cima das telas enquanto há uma sessão de foco,
 * para acompanhar o tempo sem precisar abrir a página de Foco. Pode ser arrastado e recolhido.
 */
@Component({
  selector: 'app-foco-flutuante',
  imports: [IconeComponent, RelogioBentoComponent],
  host: {
    '[class.compacto]': 'compacto()',
    '[class.arrastando]': 'arrastando()',
    '[style.left.px]': 'posicao()?.x',
    '[style.top.px]': 'posicao()?.y',
    '[style.right]': "posicao() ? 'auto' : null",
    '[style.bottom]': "posicao() ? 'auto' : null",
    role: 'region',
    'aria-label': 'Timer de foco flutuante',
  },
  template: `
    <div class="alca" (pointerdown)="iniciarArraste($event)" title="Arraste para mover">
      <app-relogio-bento [valor]="foco.percentual()" [rodando]="foco.rodando()" [pausa]="foco.fase() === 'pausa'" />
    </div>

    <button class="info" type="button" (click)="abrirFoco()" title="Abrir a tela de Foco">
      <span class="fase" [class.pausa]="foco.fase() === 'pausa'">{{ foco.fase() === 'foco' ? 'Foco' : 'Pausa' }}{{ foco.rodando() ? '' : ' · pausado' }}</span>
      <strong class="tempo">{{ foco.tempo() }}</strong>
      @if (!compacto()) {
        <span class="modulo">{{ foco.alvo()?.modulo ?? 'Sessão livre' }}</span>
      }
    </button>

    <div class="acoes">
      <button class="acao principal" type="button" (click)="foco.alternar()" [attr.aria-label]="foco.rodando() ? 'Pausar' : 'Retomar'">
        <app-icone [nome]="foco.rodando() ? 'pausa' : 'play'" [tamanho]="16" [espessura]="2.2" />
      </button>
      @if (janela.suportado) {
        <button class="acao" type="button" (click)="janela.abrir(compacto())" [disabled]="janela.aberta()" aria-label="Abrir em janela por cima de tudo" title="Janela flutuante (fica por cima de outras abas e apps)">
          <app-icone nome="externo" [tamanho]="15" />
        </button>
      }
      <button class="acao" type="button" (click)="alternarCompacto()" [attr.aria-label]="compacto() ? 'Expandir' : 'Recolher'" [title]="compacto() ? 'Expandir' : 'Recolher'">
        <app-icone [nome]="compacto() ? 'mais' : 'baixo'" [tamanho]="15" />
      </button>
    </div>
  `,
  styles: `
    :host {
      position: fixed; z-index: 70; right: 24px; bottom: 24px;
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px 10px 8px; border-radius: 22px;
      background: color-mix(in srgb, var(--superficie) 92%, transparent); backdrop-filter: blur(14px);
      border: 1px solid var(--borda-forte); box-shadow: var(--sombra);
      animation: surge .4s var(--ease);
      touch-action: none;
    }
    :host(.arrastando) { cursor: grabbing; opacity: .92; animation: none; }
    .alca { width: 78px; cursor: grab; flex: none; }
    .alca app-relogio-bento { width: 100%; }
    :host(.compacto) .alca { width: 52px; }
    .info { display: grid; justify-items: start; gap: 1px; min-width: 0; border: 0; background: none; color: inherit; text-align: left; cursor: pointer; padding: 0; }
    .fase { font-family: var(--mono); font-size: .62rem; letter-spacing: .14em; text-transform: uppercase; color: var(--acento); }
    .fase.pausa { color: var(--sucesso); }
    .tempo { font-family: var(--serif); font-size: 1.75rem; font-weight: 500; line-height: 1.05; font-variant-numeric: tabular-nums; }
    :host(.compacto) .tempo { font-size: 1.3rem; }
    .modulo { max-width: 150px; font-size: .74rem; color: var(--texto-suave); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .acoes { display: flex; flex-direction: column; gap: 6px; }
    :host(.compacto) .acoes { flex-direction: row; }
    .acao { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--borda); background: transparent; color: var(--texto-2); cursor: pointer; }
    .acao:hover { border-color: var(--borda-forte); color: var(--texto); }
    .acao:disabled { opacity: .4; cursor: default; }
    .acao.principal { background: var(--acento); border-color: var(--acento); color: var(--sobre-acento); }
    @keyframes surge { from { opacity: 0; transform: translateY(16px) scale(.96); } }
    @media (max-width: 767px) {
      :host { right: 12px; bottom: calc(var(--nav-movel) + 12px + env(safe-area-inset-bottom)); }
    }
  `,
})
export class FocoFlutuanteComponent {
  protected foco = inject(FocoService);
  protected janela = inject(FocoJanelaService);
  private router = inject(Router);
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  protected compacto = signal(this.ler(CHAVE_COMPACTO) === '1');
  protected posicao = signal<Posicao | null>(this.lerPosicao());
  protected arrastando = signal(false);
  private moveu = false;

  abrirFoco(): void {
    if (!this.moveu) this.router.navigate(['/foco']);
  }

  alternarCompacto(): void {
    this.compacto.update((c) => !c);
    this.salvar(CHAVE_COMPACTO, this.compacto() ? '1' : '0');
    // mantém o card dentro da tela depois de mudar de tamanho
    requestAnimationFrame(() => this.limitar());
  }

  iniciarArraste(evento: PointerEvent): void {
    const el = this.elemento.nativeElement;
    const ret = el.getBoundingClientRect();
    const dx = evento.clientX - ret.left;
    const dy = evento.clientY - ret.top;
    this.moveu = false;
    this.arrastando.set(true);
    (evento.target as Element).setPointerCapture?.(evento.pointerId);

    const mover = (e: PointerEvent) => {
      this.moveu = true;
      this.posicao.set(this.dentroDaTela(e.clientX - dx, e.clientY - dy));
    };
    const soltar = () => {
      this.arrastando.set(false);
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      const p = this.posicao();
      if (p) this.salvar(CHAVE_POSICAO, JSON.stringify(p));
      setTimeout(() => (this.moveu = false));
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
  }

  private limitar(): void {
    const p = this.posicao();
    if (p) this.posicao.set(this.dentroDaTela(p.x, p.y));
  }

  private dentroDaTela(x: number, y: number): Posicao {
    const el = this.elemento.nativeElement;
    const margem = 8;
    return {
      x: Math.min(Math.max(margem, x), window.innerWidth - el.offsetWidth - margem),
      y: Math.min(Math.max(margem, y), window.innerHeight - el.offsetHeight - margem),
    };
  }

  private lerPosicao(): Posicao | null {
    try {
      const p = JSON.parse(this.ler(CHAVE_POSICAO) ?? 'null') as Posicao | null;
      if (!p || p.x > window.innerWidth - 60 || p.y > window.innerHeight - 60) return null;
      return p;
    } catch {
      return null;
    }
  }

  private ler(chave: string): string | null {
    try {
      return localStorage.getItem(chave);
    } catch {
      return null;
    }
  }

  private salvar(chave: string, valor: string): void {
    try {
      localStorage.setItem(chave, valor);
    } catch {
      /* só nesta sessão */
    }
  }
}
