import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GithubRepo, GithubUsuario } from '../../core/models/github.model';
import { AuthService } from '../../core/services/auth.service';
import { AvisoService } from '../../core/services/aviso.service';
import { GithubService } from '../../core/services/github.service';
import { CabecalhoComponent } from '../../shared/cabecalho.component';
import { IconeComponent } from '../../shared/icone.component';
import { MascoteComponent } from '../../shared/mascote.component';

const CORES_LINGUAGEM: Record<string, string> = {
  TypeScript: '#5B8DEF', JavaScript: '#F2B45A', HTML: '#E9798A', CSS: '#A78BFA', SCSS: '#A78BFA',
  Python: '#4FC3A1', Java: '#F59E6B', PHP: '#8B9CF7', Vue: '#4FC3A1',
};

@Component({
  selector: 'app-github',
  imports: [FormsModule, DatePipe, CabecalhoComponent, IconeComponent, MascoteComponent],
  template: `
    <app-cabecalho numero="04" rotulo="Portfólio">
      <h1>Seu trabalho no <em>GitHub</em></h1>
      <p>Os projetos que você publica são a prova do que estuda. Conecte seu GitHub e o Bento mostra seus repositórios aqui.</p>
      @if (auth.githubUsuario()) {
        <div acoes>
          <button class="btn btn-secundario" type="button" (click)="trocar()"><app-icone nome="github" [tamanho]="16" /> Trocar conta</button>
        </div>
      }
    </app-cabecalho>

    @if (!auth.githubUsuario()) {
      <!-- ===== Guia: conectar o GitHub ao Bento ===== -->
      <section class="painel destaque guia">
        <div class="guia-topo">
          <app-mascote pose="pensando" [tamanho]="120" />
          <div>
            <p class="rotulo-mono acento">Conectar o GitHub ao Bento</p>
            <h2>Três passos e <em>pronto</em>.</h2>
            <p class="suave">Não precisa de senha nem de permissão especial: o Bento só lê o que já é público no seu perfil.</p>
          </div>
        </div>

        <ol class="passos">
          <li>
            <span class="num-passo">1</span>
            <div>
              <strong>Tenha uma conta no GitHub</strong>
              <p class="suave">É grátis. Se ainda não tem, <a class="link" href="https://github.com/signup" target="_blank" rel="noopener">crie a sua aqui</a>.</p>
            </div>
          </li>
          <li>
            <span class="num-passo">2</span>
            <div>
              <strong>Descubra seu nome de usuário</strong>
              <p class="suave">Abra <a class="link" href="https://github.com" target="_blank" rel="noopener">github.com</a> logada(o), toque na sua foto no canto superior direito: o nome em negrito é o seu usuário. Ele também aparece no endereço do perfil: <code>github.com/<b>seu-usuario</b></code>.</p>
            </div>
          </li>
          <li>
            <span class="num-passo">3</span>
            <div class="cheio">
              <strong>Cole aqui e confirme</strong>
              <form class="conectar" (ngSubmit)="previsualizar()">
                <label class="busca">
                  <app-icone nome="github" [tamanho]="17" />
                  <input [(ngModel)]="entrada" name="usuario" placeholder="seu-usuario ou link do perfil" aria-label="Usuário ou link do GitHub" autocapitalize="off" spellcheck="false" />
                </label>
                <button class="btn btn-secundario" type="submit" [disabled]="carregando() || !entrada.trim()">{{ carregando() ? 'Buscando…' : 'Buscar' }}</button>
              </form>
              @if (erro()) { <p class="campo-erro">{{ erro() }}</p> }
              @if (previa(); as p) {
                <div class="previa">
                  <img [src]="p.avatar_url" [alt]="'Foto de ' + p.login" width="48" height="48" />
                  <div><strong>{{ p.name || p.login }}</strong><span class="suave">&#64;{{ p.login }} · {{ p.public_repos }} repositórios</span></div>
                  <button class="btn btn-primario" type="button" (click)="confirmar(p.login)" [disabled]="salvando()">{{ salvando() ? 'Conectando…' : 'É esse, conectar' }}</button>
                </div>
              }
            </div>
          </li>
        </ol>
        <p class="dica suave"><app-icone nome="estrela" [tamanho]="14" /> Dica: deixe uma descrição curta em cada repositório. Ela aparece aqui e ajuda recrutadores a entender seus projetos.</p>
      </section>
    } @else {
      @if (carregando() && !usuario()) {
        <div class="esqueleto" style="height: 140px; margin-bottom: 16px"></div>
        <div class="grade-auto">@for (i of [1, 2, 3]; track i) { <div class="esqueleto" style="height: 150px"></div> }</div>
      }

      @if (erro()) {
        <div class="painel vazio"><h3>Não foi possível carregar</h3><p>{{ erro() }}</p></div>
      }

      @if (usuario(); as u) {
        <section class="painel destaque perfil" [class.apagado]="carregando()">
          <img [src]="u.avatar_url" [alt]="'Foto de ' + u.login" width="88" height="88" />
          <div class="perfil-texto">
            <p class="rotulo-mono acento"><span class="ponto-on"></span> Conectado ao Bento</p>
            <h2>{{ u.name || u.login }}</h2>
            <a class="link-texto" [href]="u.html_url" target="_blank" rel="noopener">&#64;{{ u.login }} <app-icone nome="externo" [tamanho]="12" /></a>
            @if (u.bio) { <p class="suave">{{ u.bio }}</p> }
          </div>
          <dl class="numeros">
            <div><dt class="rotulo-mono">Repositórios</dt><dd class="num">{{ u.public_repos }}</dd></div>
            <div><dt class="rotulo-mono">Seguidores</dt><dd class="num">{{ u.followers }}</dd></div>
            <div><dt class="rotulo-mono">Seguindo</dt><dd class="num">{{ u.following }}</dd></div>
          </dl>
        </section>

        <div class="filtros">
          <p class="rotulo-mono">{{ filtrados().length }} repositórios</p>
          @if (linguagens().length > 1) {
            <div class="chips">
              <button class="chip" type="button" [class.ativo]="!linguagem()" (click)="linguagem.set(null)">Todas</button>
              @for (l of linguagens(); track l) {
                <button class="chip" type="button" [class.ativo]="linguagem() === l" (click)="linguagem.set(l)"><span class="bolinha" [style.background]="cor(l)"></span>{{ l }}</button>
              }
            </div>
          }
        </div>

        <div class="grade-auto">
          @for (r of filtrados(); track r.id) {
            <a class="painel repo" [href]="r.html_url" target="_blank" rel="noopener">
              <div class="repo-topo">
                <h3>{{ r.name }}</h3>
                <app-icone nome="externo" [tamanho]="15" />
              </div>
              <p class="desc">{{ r.description || 'Sem descrição.' }}</p>
              <div class="meta">
                @if (r.language) { <span><span class="bolinha" [style.background]="cor(r.language)"></span>{{ r.language }}</span> }
                <span><app-icone nome="estrela" [tamanho]="13" /> {{ r.stargazers_count }}</span>
                <span>{{ r.updated_at | date: 'dd MMM yyyy' }}</span>
              </div>
            </a>
          } @empty {
            <div class="painel vazio"><p>Nenhum repositório público ainda.</p></div>
          }
        </div>
      }
    }
  `,
  styles: `
    .guia { display: grid; gap: 22px; padding: clamp(20px, 3vw, 32px); }
    .guia-topo { display: flex; align-items: center; gap: 20px; }
    .guia-topo h2 { font-size: clamp(1.5rem, 2.6vw, 2rem); margin: 6px 0; }
    .passos { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
    .passos li { display: grid; grid-template-columns: 36px 1fr; gap: 14px; padding: 16px 0; border-top: 1px solid var(--borda); }
    .num-passo { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--acento-suave); color: var(--acento); font-family: var(--mono); font-weight: 500; }
    .passos strong { display: block; margin-bottom: 4px; }
    .passos p { font-size: .9rem; }
    .link { color: var(--acento); text-decoration: underline; text-underline-offset: 3px; }
    code { font-family: var(--mono); font-size: .82rem; padding: 1px 6px; border-radius: 5px; background: var(--superficie-2); }
    .cheio { display: grid; gap: 10px; }
    .conectar { display: flex; flex-wrap: wrap; gap: 8px; }
    .conectar .busca { flex: 1 1 240px; }
    .previa { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--borda-forte); border-radius: var(--r-3); background: var(--superficie-2); }
    .previa img { border-radius: 50%; }
    .previa div { flex: 1; display: grid; min-width: 160px; }
    .previa span { font-size: .82rem; }
    .dica { display: flex; align-items: center; gap: 8px; font-size: .85rem; }

    .perfil { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 20px 28px; transition: opacity .2s; }
    .perfil.apagado { opacity: .5; }
    .perfil img { border-radius: 50%; border: 1px solid var(--borda-forte); }
    .perfil-texto { display: grid; gap: 8px; justify-items: start; }
    .perfil-texto .rotulo-mono { display: flex; align-items: center; gap: 6px; }
    .ponto-on { width: 7px; height: 7px; border-radius: 50%; background: var(--sucesso); box-shadow: 0 0 0 3px var(--sucesso-suave); }
    .perfil-texto p { font-size: .9rem; }
    .numeros { display: flex; gap: 28px; margin: 0; }
    .numeros div { display: grid; gap: 4px; }
    .numeros dd { margin: 0; font-size: 1.5rem; }
    .filtros { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin: 24px 0 14px; }
    .bolinha { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
    .repo { display: grid; gap: 10px; align-content: start; transition: border-color .2s, background .2s; }
    .repo:hover { border-color: var(--borda-forte); background: var(--superficie-2); }
    .repo-topo { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; color: var(--texto-suave); }
    .repo h3 { color: var(--texto); font-family: var(--sans); font-size: 1rem; font-weight: 600; overflow-wrap: anywhere; letter-spacing: 0; }
    .desc { font-size: .88rem; color: var(--texto-suave); }
    .meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: .78rem; color: var(--texto-suave); }
    .meta span { display: inline-flex; align-items: center; gap: 5px; }
    @media (max-width: 860px) {
      .perfil { grid-template-columns: auto minmax(0, 1fr); }
      .numeros { grid-column: 1 / -1; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--borda); }
    }
    @media (max-width: 560px) {
      .guia-topo { flex-direction: column; align-items: flex-start; }
      .guia-topo app-mascote { align-self: center; }
      .perfil img { width: 64px; height: 64px; }
    }
  `,
})
export class GithubComponent implements OnInit {
  private github = inject(GithubService);
  protected auth = inject(AuthService);
  private aviso = inject(AvisoService);

  protected entrada = '';
  protected previa = signal<GithubUsuario | null>(null);
  protected usuario = signal<GithubUsuario | null>(null);
  protected repos = signal<GithubRepo[]>([]);
  protected carregando = signal(false);
  protected salvando = signal(false);
  protected erro = signal<string | null>(null);
  protected linguagem = signal<string | null>(null);

  protected linguagens = computed(() => [...new Set(this.repos().map((r) => r.language).filter((l): l is string => !!l))].sort());
  protected filtrados = computed(() => {
    const l = this.linguagem();
    return l ? this.repos().filter((r) => r.language === l) : this.repos();
  });

  constructor() {
    // Quando a conta conectada muda (ou carrega), busca o perfil e os repositórios.
    effect(() => {
      const login = this.auth.githubUsuario();
      untracked(() => (login ? this.carregar(login) : this.limpar()));
    });
  }

  ngOnInit(): void {
    this.entrada = '';
  }

  protected cor(linguagem: string): string {
    return CORES_LINGUAGEM[linguagem] ?? '#8794B0';
  }

  /** Aceita "usuario", "@usuario" ou um link github.com/usuario. */
  private extrairLogin(texto: string): string {
    const limpo = texto.trim().replace(/^@/, '');
    const doLink = limpo.match(/github\.com\/([A-Za-z0-9-]+)/i);
    return (doLink ? doLink[1] : limpo).replace(/[^A-Za-z0-9-]/g, '');
  }

  previsualizar(): void {
    const login = this.extrairLogin(this.entrada);
    if (!login) return;
    this.carregando.set(true);
    this.erro.set(null);
    this.previa.set(null);
    this.github.usuario(login).subscribe({
      next: (u) => {
        this.previa.set(u);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Não encontramos esse usuário. Confira se digitou igual ao do seu perfil.');
      },
    });
  }

  async confirmar(login: string): Promise<void> {
    this.salvando.set(true);
    const erro = await this.auth.conectarGithub(login);
    this.salvando.set(false);
    if (erro) this.aviso.mostrar(erro);
    else this.aviso.mostrar('GitHub conectado ao Bento!');
  }

  async trocar(): Promise<void> {
    await this.auth.conectarGithub(null);
    this.previa.set(null);
    this.entrada = '';
  }

  private limpar(): void {
    this.usuario.set(null);
    this.repos.set([]);
    this.erro.set(null);
  }

  private carregar(login: string): void {
    this.carregando.set(true);
    this.erro.set(null);
    forkJoin({ usuario: this.github.usuario(login), repos: this.github.repositorios(login) }).subscribe({
      next: ({ usuario, repos }) => {
        this.usuario.set(usuario);
        this.repos.set(repos);
        this.linguagem.set(null);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Verifique sua conexão ou tente de novo em alguns minutos (o GitHub limita consultas sem login).');
      },
    });
  }
}
