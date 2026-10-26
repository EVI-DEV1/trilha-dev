import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { TrilhasService } from './core/services/trilhas.service';
import { AvisoService } from './core/services/aviso.service';
import { FocoService } from './core/services/foco.service';
import { ComemoracaoService } from './core/services/comemoracao.service';
import { TemaService } from './core/services/tema.service';
import { AtualizacaoService } from './core/services/atualizacao.service';
import { ConfeteComponent } from './shared/confete.component';
import { IconeComponent, NomeIcone } from './shared/icone.component';
import { MarcaComponent } from './shared/marca.component';
import { FocoFlutuanteComponent } from './shared/foco-flutuante.component';

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: NomeIcone;
}

/** Telas "cheias", sem barra lateral nem navegação. */
const TELAS_SOLTAS = /^\/(entrar|boas-vindas|redefinir-senha|baixar)/;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconeComponent, ConfeteComponent, MarcaComponent, FocoFlutuanteComponent],
  template: `
    <a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>

    @if (comShell()) {
      <!-- Barra lateral (tablet e desktop) -->
      <aside class="lateral" aria-label="Navegação principal">
        <a routerLink="/" class="lateral-marca" aria-label="Trilha, início"><app-marca /></a>

        <nav class="lateral-nav">
          @for (item of menu; track item.rota) {
            <a [routerLink]="item.rota" routerLinkActive="ativo" [routerLinkActiveOptions]="{ exact: item.rota === '/' }" [attr.title]="item.rotulo">
              <app-icone [nome]="item.icone" [tamanho]="19" />
              <span class="lateral-rotulo">{{ item.rotulo }}</span>
              @if (item.rota === '/foco' && foco.rodando()) { <span class="ao-vivo" aria-label="Timer rodando"></span> }
            </a>
          }
        </nav>

        @if (foco.rodando() || foco.alvo()) {
          <a routerLink="/foco" class="lateral-foco">
            <span class="rotulo-mono">{{ foco.fase() === 'foco' ? 'Em foco' : 'Pausa' }}</span>
            <strong class="num">{{ foco.tempo() }}</strong>
            @if (foco.alvo(); as a) { <span class="alvo">{{ a.modulo }}</span> }
          </a>
        }

        <a routerLink="/conta" routerLinkActive="ativo" class="lateral-usuario" title="Minha conta">
          <span class="inicial">{{ inicial() }}</span>
          <span class="dados">
            <strong>{{ auth.nome() }}</strong>
            <small>{{ auth.email() ?? 'Modo local' }}</small>
          </span>
          <app-icone nome="engrenagem" [tamanho]="17" />
        </a>
      </aside>

      <!-- Barra superior (celular) -->
      <header class="topo-movel">
        <a routerLink="/" aria-label="Trilha, início"><app-marca [completa]="false" /></a>
        <div class="topo-acoes">
          @if (foco.rodando()) {
            <a routerLink="/foco" class="pilula-foco"><span class="ao-vivo"></span><span class="num">{{ foco.tempo() }}</span></a>
          }
          <a routerLink="/conta" class="inicial" aria-label="Minha conta">{{ inicial() }}</a>
        </div>
      </header>
    }

    <main id="conteudo" class="conteudo" [class.solta]="!comShell()">
      <router-outlet />
    </main>

    @if (comShell()) {
      <!-- Navegação inferior (celular) -->
      <nav class="nav-movel" aria-label="Navegação principal">
        @for (item of menuMovel; track item.rota) {
          <a [routerLink]="item.rota" routerLinkActive="ativo" [routerLinkActiveOptions]="{ exact: item.rota === '/' }">
            <app-icone [nome]="item.icone" [tamanho]="21" />
            <span>{{ item.rotulo }}</span>
            @if (item.rota === '/foco' && foco.rodando()) { <span class="ao-vivo"></span> }
          </a>
        }
      </nav>
    }

    @if (comShell() && foco.sessaoAtiva() && !naTelaFoco()) { <app-foco-flutuante /> }

    @if (comemoracao.mensagem(); as festa) { <app-confete [mensagem]="festa" /> }

    @if (atualizacao.disponivel() && !atualizacaoDispensada()) {
      <div class="atualizacao" role="status">
        <span><strong>Nova versão do Trilha</strong> pronta para usar.</span>
        <button class="btn btn-primario btn-sm" type="button" (click)="atualizacao.atualizar()">Atualizar</button>
        <button class="btn-icone fechar-atualizacao" type="button" aria-label="Depois" (click)="atualizacaoDispensada.set(true)"><app-icone nome="fechar" [tamanho]="15" /></button>
      </div>
    }

    @if (aviso.mensagem(); as msg) {
      <div class="aviso" role="status" (click)="aviso.limpar()">{{ msg }}</div>
    }
  `,
  styles: `
    :host { display: block; min-height: 100dvh; background: var(--brilho), var(--fundo); }

    .pular-conteudo { position: absolute; left: -999px; top: 8px; z-index: 100; padding: 10px 14px; background: var(--acento); color: var(--sobre-acento); border-radius: 8px; }
    .pular-conteudo:focus { left: 8px; }

    /* ----- Lateral ----- */
    .lateral {
      position: fixed; inset: 0 auto 0 0; z-index: 40; width: var(--sidebar);
      display: flex; flex-direction: column; gap: 6px; padding: 22px 14px 16px;
      background: var(--fundo-2); border-right: 1px solid var(--borda);
    }
    .lateral-marca { padding: 4px 10px 22px; }
    .lateral-nav { display: grid; gap: 2px; }
    .lateral-nav a {
      position: relative; display: flex; align-items: center; gap: 12px;
      min-height: 42px; padding: 0 12px; border-radius: var(--r-2);
      color: var(--texto-suave); font-weight: 500; font-size: .92rem;
      transition: background .2s, color .2s;
    }
    .lateral-nav a:hover { background: var(--superficie); color: var(--texto); }
    .lateral-nav a.ativo { background: var(--superficie-2); color: var(--texto); }
    .lateral-nav a.ativo::before { content: ''; position: absolute; left: -14px; top: 10px; bottom: 10px; width: 2px; border-radius: 2px; background: var(--acento); }
    .lateral-nav a.ativo app-icone { color: var(--acento); }

    .lateral-foco {
      display: grid; gap: 2px; margin-top: 18px; padding: 14px;
      border: 1px solid color-mix(in srgb, var(--acento) 35%, transparent); border-radius: var(--r-assinatura);
      background: var(--acento-suave);
    }
    .lateral-foco strong { font-size: 1.6rem; font-weight: 500; }
    .lateral-foco .alvo { font-size: .78rem; color: var(--texto-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .lateral-usuario {
      margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 10px;
      border: 1px solid var(--borda); border-radius: var(--r-3); color: var(--texto-suave);
      transition: border-color .2s;
    }
    .lateral-usuario:hover, .lateral-usuario.ativo { border-color: var(--borda-forte); color: var(--texto); }
    .dados { flex: 1; min-width: 0; display: grid; }
    .dados strong { color: var(--texto); font-size: .86rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dados small { font-size: .72rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .inicial {
      display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 50%;
      background: var(--acento-suave); color: var(--acento); border: 1px solid color-mix(in srgb, var(--acento) 40%, transparent);
      font-family: var(--serif); font-style: italic; font-size: 1rem;
    }

    .ao-vivo { width: 7px; height: 7px; border-radius: 50%; background: var(--acento); box-shadow: 0 0 0 3px var(--acento-suave); animation: pulso 1.6s infinite; }
    .lateral-nav .ao-vivo { margin-left: auto; }
    @keyframes pulso { 50% { opacity: .35; } }

    /* ----- Conteúdo ----- */
    .conteudo { margin-left: var(--sidebar); padding: clamp(24px, 4vw, 44px) var(--gutter) 64px; }
    .conteudo > ::ng-deep * { max-width: var(--largura-max); margin-left: auto; margin-right: auto; }
    .conteudo.solta { margin-left: 0; padding: 0; }
    .conteudo.solta > ::ng-deep * { max-width: none; }

    .topo-movel, .nav-movel { display: none; }

    /* ----- Tablet: lateral só com ícones ----- */
    @media (max-width: 1099px) {
      :host { --sidebar: 76px; }
      .lateral { padding: 20px 10px; align-items: center; }
      .lateral-marca { padding: 4px 0 20px; }
      .lateral-marca ::ng-deep .nome, .lateral-marca ::ng-deep .dev { display: none; }
      .lateral-nav a { justify-content: center; width: 48px; padding: 0; }
      .lateral-nav a.ativo::before { left: -10px; }
      .lateral-rotulo, .dados, .lateral-usuario app-icone, .lateral-foco .alvo, .lateral-foco .rotulo-mono { display: none; }
      .lateral-nav .ao-vivo { position: absolute; top: 8px; right: 8px; margin: 0; }
      .lateral-foco { padding: 8px 4px; text-align: center; }
      .lateral-foco strong { font-size: .8rem; }
      .lateral-usuario { padding: 6px; border: 0; }
    }

    /* ----- Celular ----- */
    @media (max-width: 767px) {
      .lateral { display: none; }
      .topo-movel {
        position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between;
        height: calc(var(--topo-movel) + env(safe-area-inset-top)); padding: env(safe-area-inset-top) 16px 0;
        background: color-mix(in srgb, var(--fundo) 88%, transparent); backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--borda);
      }
      .topo-acoes { display: flex; align-items: center; gap: 10px; }
      .pilula-foco { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: var(--pilula); background: var(--acento-suave); color: var(--acento); font-size: .9rem; }
      .conteudo { margin-left: 0; padding: 20px 16px calc(var(--nav-movel) + 32px + env(safe-area-inset-bottom)); }
      .nav-movel {
        position: fixed; inset: auto 0 0 0; z-index: 40; display: grid; grid-template-columns: repeat(5, 1fr);
        height: calc(var(--nav-movel) + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom);
        background: color-mix(in srgb, var(--fundo-2) 94%, transparent); backdrop-filter: blur(12px);
        border-top: 1px solid var(--borda);
      }
      .nav-movel a { position: relative; display: grid; place-items: center; align-content: center; gap: 3px; color: var(--texto-suave); font-size: .68rem; font-weight: 500; }
      .nav-movel a.ativo { color: var(--acento); }
      .nav-movel a.ativo::before { content: ''; position: absolute; top: 0; left: 30%; right: 30%; height: 2px; background: var(--acento); border-radius: 0 0 2px 2px; }
      .nav-movel .ao-vivo { position: absolute; top: 12px; right: calc(50% - 16px); }
    }

    .aviso {
      position: fixed; z-index: 90; left: 50%; bottom: 28px; transform: translateX(-50%);
      width: max-content; max-width: min(440px, calc(100% - 32px));
      padding: 12px 18px; border-radius: var(--r-2); cursor: pointer;
      background: var(--superficie-3); color: var(--texto); border: 1px solid var(--borda-forte);
      border-left: 3px solid var(--acento); box-shadow: var(--sombra); font-size: .9rem;
      animation: entra .3s var(--ease);
    }
    @media (max-width: 767px) { .aviso { bottom: calc(var(--nav-movel) + 16px + env(safe-area-inset-bottom)); } }
    @keyframes entra { from { opacity: 0; translate: 0 8px; } }

    .atualizacao {
      position: fixed; z-index: 95; left: 50%; top: calc(14px + env(safe-area-inset-top)); transform: translateX(-50%);
      display: flex; align-items: center; gap: 10px;
      width: max-content; max-width: calc(100% - 24px);
      padding: 8px 8px 8px 16px; border-radius: var(--r-2);
      background: var(--superficie-3); color: var(--texto); border: 1px solid var(--borda-forte); box-shadow: var(--sombra);
      font-size: .88rem; animation: entra .3s var(--ease);
    }
    .atualizacao strong { font-weight: 600; }
    .fechar-atualizacao { width: 32px; height: 32px; border: 0; }
  `,
})
export class AppComponent {
  private trilhas = inject(TrilhasService);
  private router = inject(Router);
  protected auth = inject(AuthService);
  protected aviso = inject(AvisoService);
  protected foco = inject(FocoService);
  protected comemoracao = inject(ComemoracaoService);
  // Criado já na abertura para acompanhar a troca de tema do sistema em qualquer página.
  private tema = inject(TemaService);
  // Procura versões novas do app instalado e mostra o aviso "Atualizar".
  protected atualizacao = inject(AtualizacaoService);
  protected atualizacaoDispensada = signal(false);

  protected menu: ItemMenu[] = [
    { rota: '/', rotulo: 'Painel', icone: 'painel' },
    { rota: '/trilhas', rotulo: 'Trilhas', icone: 'trilhas' },
    { rota: '/foco', rotulo: 'Foco', icone: 'relogio' },
    { rota: '/github', rotulo: 'Portfólio', icone: 'github' },
  ];
  protected menuMovel: ItemMenu[] = [...this.menu, { rota: '/conta', rotulo: 'Conta', icone: 'engrenagem' }];

  private titulo = inject(Title);
  protected inicial = computed(() => this.auth.nome().charAt(0).toUpperCase());

  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: '' },
  );
  /** Na tela de Foco o timer grande já aparece; o flutuante fica escondido. */
  protected naTelaFoco = computed(() => this.url().startsWith('/foco'));

  /** Barra lateral e navegação aparecem só nas telas internas. */
  protected comShell = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => !TELAS_SOLTAS.test(e.urlAfterRedirects)),
    ),
    { initialValue: false },
  );

  constructor() {
    // Mostra o tempo restante no título da aba enquanto há sessão de foco.
    effect(() => {
      const ativo = this.foco.sessaoAtiva();
      const tempo = this.foco.tempo();
      const fase = this.foco.fase() === 'foco' ? 'Foco' : 'Pausa';
      this.url();
      untracked(() => {
        const base = this.titulo.getTitle().replace(/^⏱ \d{2}:\d{2} · (Foco|Pausa) — /, '');
        this.titulo.setTitle(ativo ? `⏱ ${tempo} · ${fase} — ${base}` : base);
      });
    });

    // Carrega dados quando há sessão; limpa ao sair da conta.
    effect(() => {
      if (!this.auth.pronto()) return;
      const logado = this.auth.logado();
      untracked(() => {
        if (logado) {
          this.trilhas.carregar();
          this.foco.carregar();
        } else {
          this.trilhas.limpar();
          this.foco.limpar();
        }
      });
    });
  }
}
