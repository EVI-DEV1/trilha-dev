import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InstalarService, Plataforma } from '../../core/services/instalar.service';
import { IconeComponent } from '../../shared/icone.component';
import { MarcaComponent } from '../../shared/marca.component';
import { MascoteComponent } from '../../shared/mascote.component';

interface Guia {
  id: Plataforma;
  nome: string;
  navegador: string;
  passos: string[];
}

/** Página pública de download: instala o Trilha como app (PWA), grátis e sem loja. */
@Component({
  selector: 'app-baixar',
  imports: [RouterLink, IconeComponent, MarcaComponent, MascoteComponent],
  template: `
    <header class="topo">
      <a routerLink="/" aria-label="Trilha, início"><app-marca /></a>
      <a class="btn btn-fantasma btn-sm" [routerLink]="auth.logado() ? '/' : '/entrar'">{{ auth.logado() ? 'Abrir o app' : 'Entrar' }}</a>
    </header>

    <main>
      <section class="heroi">
        <div class="heroi-texto">
          <p class="rotulo-mono acento">Grátis · sem loja de apps</p>
          <h1>Leve o Bento <em>no bolso</em>.</h1>
          <p class="sub">Instale o Trilha no celular ou no computador em segundos. Ele abre como app, com ícone próprio, funciona sem internet e se atualiza sozinho.</p>

          <div class="cta">
            @if (instalar.instalado()) {
              <p class="ok"><app-icone nome="check" [tamanho]="18" /> O Trilha já está instalado neste aparelho.</p>
            } @else if (instalar.podeInstalar()) {
              <button class="btn btn-primario btn-lg" type="button" (click)="instalarAgora()">
                <app-icone nome="download" [tamanho]="18" /> Instalar agora
              </button>
              <span class="suave pequeno">Um toque. Sem cadastro em loja.</span>
            } @else {
              <a class="btn btn-primario btn-lg" href="#como" (click)="rolar($event)"><app-icone nome="download" [tamanho]="18" /> Ver como instalar</a>
              <span class="suave pequeno">Detectamos: {{ nomeAtual() }}</span>
            }
          </div>

          <ul class="selos">
            <li><app-icone nome="check" [tamanho]="15" /> 100% gratuito</li>
            <li><app-icone nome="check" [tamanho]="15" /> Ocupa menos de 2 MB</li>
            <li><app-icone nome="check" [tamanho]="15" /> Android, iPhone, Windows e Mac</li>
          </ul>
        </div>

        <div class="telefone" aria-hidden="true">
          <div class="tela">
            <span class="notch"></span>
            <app-mascote pose="acenando" [tamanho]="150" />
            <p class="tel-titulo">Trilha</p>
            <p class="tel-sub">Seu planner de estudos</p>
            <span class="tel-barra"><span></span></span>
          </div>
        </div>
      </section>

      <section id="como" class="como">
        <div class="abas segmentos" role="tablist" aria-label="Escolha seu aparelho">
          @for (g of guias; track g.id) {
            <button type="button" role="tab" [class.ativo]="aba() === g.id" [attr.aria-selected]="aba() === g.id" (click)="aba.set(g.id)">{{ g.nome }}</button>
          }
        </div>

        @for (g of guias; track g.id) {
          @if (aba() === g.id) {
            <div class="painel guia" role="tabpanel">
              <p class="rotulo-mono">No {{ g.navegador }}</p>
              <ol>
                @for (p of g.passos; track $index) {
                  <li><span class="n">{{ $index + 1 }}</span><span [innerHTML]="p"></span></li>
                }
              </ol>
            </div>
          }
        }
      </section>

      <section class="painel qr">
        <img [src]="qr" width="168" height="168" alt="QR code com o endereço do Trilha" loading="lazy" />
        <div>
          <p class="rotulo-mono acento">Está no computador?</p>
          <h2>Aponte a câmera do celular</h2>
          <p class="suave">O QR code abre esta página no celular. Depois é só seguir os passos acima.</p>
          <button class="btn btn-secundario btn-sm" type="button" (click)="copiar()">{{ copiado() ? 'Link copiado!' : 'Copiar link' }}</button>
        </div>
      </section>

      <section class="faq">
        <h2>Perguntas rápidas</h2>
        <details class="painel"><summary>Por que não está na Play Store ou App Store?</summary><p class="suave">O Trilha é um app web instalável (PWA). Você instala direto do navegador, sem loja, sem taxa e sempre na versão mais nova. Seus dados ficam sincronizados na sua conta.</p></details>
        <details class="painel"><summary>É seguro?</summary><p class="suave">Sim. O app roda no próprio navegador, com conexão segura (HTTPS), e não pede acesso a fotos, contatos ou arquivos.</p></details>
        <details class="painel"><summary>Como desinstalar?</summary><p class="suave">Como qualquer app: segure o ícone e escolha remover (celular) ou, no computador, abra o app e use o menu ⋮ → Desinstalar.</p></details>
      </section>
    </main>

    <footer class="rodape suave">Trilha · feito para quem estuda programação</footer>
  `,
  styles: `
    :host { display: block; min-height: 100dvh; background: var(--brilho), var(--fundo); padding: clamp(16px, 4vw, 40px); }
    main, .topo, .rodape { max-width: 1080px; margin: 0 auto; }
    .topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: clamp(24px, 5vw, 56px); }
    .topo a:first-child { color: inherit; text-decoration: none; }
    .heroi { display: grid; grid-template-columns: 1.2fr .8fr; gap: clamp(24px, 5vw, 64px); align-items: center; }
    .heroi-texto { display: grid; gap: 18px; }
    h1 { font-size: clamp(2.3rem, 6vw, 4rem); line-height: 1.02; letter-spacing: -.04em; }
    .sub { color: var(--texto-2); font-size: 1.05rem; max-width: 480px; }
    .cta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; margin-top: 6px; }
    .pequeno { font-size: .82rem; }
    .ok { display: flex; align-items: center; gap: 8px; color: var(--sucesso); font-weight: 600; }
    .selos { list-style: none; padding: 0; margin: 4px 0 0; display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: .88rem; color: var(--texto-2); }
    .selos li { display: flex; align-items: center; gap: 6px; }
    .selos app-icone { color: var(--sucesso); }

    .telefone { justify-self: center; width: min(260px, 70vw); aspect-ratio: 9 / 18.5; padding: 10px; border-radius: 40px; background: linear-gradient(160deg, #23304f, #0b1124); box-shadow: 0 30px 80px rgb(0 0 0 / 45%), inset 0 0 0 1px rgb(255 255 255 / 10%); }
    .tela { position: relative; height: 100%; border-radius: 31px; background: radial-gradient(120% 70% at 50% 20%, #1c2c5c, #0a1020 70%); display: grid; place-content: center; justify-items: center; gap: 4px; overflow: hidden; }
    .notch { position: absolute; top: 10px; left: 50%; translate: -50% 0; width: 70px; height: 20px; border-radius: 20px; background: #05070f; }
    .tel-titulo { font-family: var(--serif); font-size: 1.6rem; color: #fff; margin-top: 8px; }
    .tel-sub { font-size: .8rem; color: #a9b6d6; }
    .tel-barra { width: 120px; height: 6px; border-radius: 6px; background: rgb(255 255 255 / 10%); margin-top: 16px; overflow: hidden; }
    .tel-barra span { display: block; height: 100%; width: 60%; background: linear-gradient(90deg, #4fd1ff, #8b7bff); animation: carrega 2.4s ease-in-out infinite; }
    @keyframes carrega { 50% { width: 95%; } }

    .como { margin-top: clamp(40px, 7vw, 80px); display: grid; gap: 16px; scroll-margin-top: 20px; }
    .abas { justify-self: start; }
    .guia ol { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 14px; }
    .guia li { display: flex; gap: 14px; align-items: flex-start; line-height: 1.5; }
    .n { flex: none; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--acento-suave); color: var(--acento); font-family: var(--mono); }
    :host ::ng-deep .guia b { color: var(--texto); }
    :host ::ng-deep .guia kbd { font-family: var(--mono); font-size: .8rem; padding: 1px 7px; border: 1px solid var(--borda-forte); border-radius: 6px; background: var(--superficie-2); }

    .qr { margin-top: 24px; display: flex; align-items: center; gap: 24px; }
    .qr img { border-radius: 14px; background: #fff; padding: 8px; flex: none; }
    .qr div { display: grid; gap: 8px; justify-items: start; }
    .qr h2 { font-size: 1.5rem; }

    .faq { margin-top: 40px; display: grid; gap: 10px; }
    .faq h2 { font-size: 1.4rem; margin-bottom: 6px; }
    details summary { cursor: pointer; font-weight: 600; }
    details p { margin-top: 10px; font-size: .92rem; }
    .rodape { text-align: center; font-size: .8rem; padding: 40px 0 8px; }

    @media (max-width: 820px) {
      .heroi { grid-template-columns: 1fr; }
      .telefone { order: -1; width: min(200px, 56vw); }
      .qr { display: none; } /* no celular o QR não faz sentido */
      .abas { justify-self: stretch; }
      .abas button { flex: 1; }
    }
  `,
})
export class BaixarComponent {
  protected instalar = inject(InstalarService);
  protected auth = inject(AuthService);
  protected aba = signal<Plataforma>(this.instalar.plataforma);
  protected copiado = signal(false);

  private endereco = `${location.origin}/baixar`;
  protected qr = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&data=${encodeURIComponent(this.endereco)}`;

  protected guias: Guia[] = [
    {
      id: 'android', nome: 'Android', navegador: 'Chrome',
      passos: [
        'Abra este endereço no <b>Chrome</b> do celular.',
        'Toque em <b>Instalar agora</b> acima, ou no menu <kbd>⋮</kbd> → <b>Instalar app</b> (ou “Adicionar à tela inicial”).',
        'Confirme em <b>Instalar</b>. O ícone do Bento aparece junto com seus outros apps.',
      ],
    },
    {
      id: 'iphone', nome: 'iPhone', navegador: 'Safari',
      passos: [
        'Abra este endereço no <b>Safari</b> (no iPhone, a instalação funciona por ele).',
        'Toque no botão <b>Compartilhar</b> <kbd>⬆</kbd> na barra de baixo.',
        'Role e escolha <b>Adicionar à Tela de Início</b>, depois <b>Adicionar</b>.',
      ],
    },
    {
      id: 'computador', nome: 'Computador', navegador: 'Chrome ou Edge',
      passos: [
        'Abra o Trilha no <b>Chrome</b> ou no <b>Edge</b>.',
        'Clique em <b>Instalar agora</b> acima, ou no ícone de instalar <kbd>⊕</kbd> no fim da barra de endereço.',
        'Pronto: o Trilha abre em janela própria e pode ficar fixado na barra de tarefas.',
      ],
    },
  ];

  protected nomeAtual(): string {
    return this.guias.find((g) => g.id === this.instalar.plataforma)?.nome ?? 'Computador';
  }

  async instalarAgora(): Promise<void> {
    await this.instalar.instalar();
  }

  rolar(e: Event): void {
    e.preventDefault();
    document.getElementById('como')?.scrollIntoView({ behavior: 'smooth' });
  }

  async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.endereco);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      /* sem permissão de área de transferência */
    }
  }
}
