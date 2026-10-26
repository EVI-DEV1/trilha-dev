import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AvisoService } from '../../core/services/aviso.service';
import { FocoService, OPCOES_META_HORAS } from '../../core/services/foco.service';
import { TemaService } from '../../core/services/tema.service';
import { TrilhasService } from '../../core/services/trilhas.service';
import { CabecalhoComponent } from '../../shared/cabecalho.component';
import { IconeComponent } from '../../shared/icone.component';
import { FolhaComponent } from '../../shared/folha.component';
import { SugestoesCursoComponent } from '../../shared/sugestoes-curso.component';
import { CursoService } from '../../core/services/curso.service';

@Component({
  selector: 'app-conta',
  imports: [FormsModule, RouterLink, CabecalhoComponent, IconeComponent, FolhaComponent, SugestoesCursoComponent],
  template: `
    <app-cabecalho numero="05" rotulo="Conta">
      <h1>Sua <em>conta</em></h1>
      <p>Perfil, preferências e seus dados.</p>
    </app-cabecalho>

    <div class="secoes">
      <section class="painel">
        <div class="secao-cab">
          <h2>Perfil</h2>
          <span class="etiqueta" [class.acento]="auth.modoNuvem">{{ auth.modoNuvem ? 'Nuvem · sincronizado' : 'Modo local' }}</span>
        </div>
        <form class="form" (ngSubmit)="salvarNome()">
          <label class="campo-grupo">
            <span>Nome</span>
            <input class="campo" name="nome" [(ngModel)]="nome" [disabled]="!auth.modoNuvem" maxlength="60" autocomplete="name" />
          </label>
          <label class="campo-grupo">
            <span>E-mail</span>
            <input class="campo" [value]="auth.email() ?? '—'" disabled />
          </label>
          @if (auth.modoNuvem) {
            <div><button class="btn btn-secundario" type="submit" [disabled]="salvandoNome() || !nome.trim()">{{ salvandoNome() ? 'Salvando…' : 'Salvar nome' }}</button></div>
          } @else {
            <p class="campo-dica">Configure o Supabase (docs/09) para ter conta, login e dados sincronizados.</p>
          }
        </form>
      </section>

      <section class="painel">
        <div class="secao-cab"><h2>Preferências</h2></div>
        <div class="preferencia">
          <div>
            <strong>Tema</strong>
            <p class="suave">Por padrão, acompanha o tema do seu sistema. Você pode fixar um deles.</p>
          </div>
          <div class="segmentos" role="radiogroup" aria-label="Tema">
            <button type="button" role="radio" [class.ativo]="tema.preferencia() === 'sistema'" [attr.aria-checked]="tema.preferencia() === 'sistema'" (click)="tema.definir('sistema')"><app-icone nome="painel" [tamanho]="15" /> Sistema</button>
            <button type="button" role="radio" [class.ativo]="tema.preferencia() === 'escuro'" [attr.aria-checked]="tema.preferencia() === 'escuro'" (click)="tema.definir('escuro')"><app-icone nome="lua" [tamanho]="15" /> Escuro</button>
            <button type="button" role="radio" [class.ativo]="tema.preferencia() === 'claro'" [attr.aria-checked]="tema.preferencia() === 'claro'" (click)="tema.definir('claro')"><app-icone nome="sol" [tamanho]="15" /> Claro</button>
          </div>
        </div>
        <div class="preferencia">
          <div>
            <strong>Meta semanal de foco</strong>
            <p class="suave">Quanto tempo você quer estudar com foco a cada 7 dias.</p>
          </div>
          <div class="chips">
            @for (h of opcoesMeta; track h) {
              <button class="chip" type="button" [class.ativo]="foco.metaSemanal() === h * 60" [attr.aria-pressed]="foco.metaSemanal() === h * 60" (click)="definirMeta(h)">{{ h }} h</button>
            }
          </div>
        </div>
      </section>

      <section class="painel">
        <div class="secao-cab"><h2>App</h2></div>
        <div class="preferencia">
          <div>
            <strong>Instalar o Trilha</strong>
            <p class="suave">Grátis, no celular ou no computador. Abre como app e funciona sem internet.</p>
          </div>
          <a class="btn btn-secundario" routerLink="/baixar"><app-icone nome="download" [tamanho]="16" /> Baixar</a>
        </div>
      </section>

      <section class="painel">
        <div class="secao-cab"><h2>Conexões</h2></div>
        <div class="preferencia">
          <div>
            <strong>GitHub</strong>
            <p class="suave">
              @if (auth.githubUsuario(); as g) { Conectado como <b>&#64;{{ g }}</b>. Seus repositórios aparecem no Portfólio. }
              @else { Conecte para o Bento mostrar seus projetos no Portfólio. }
            </p>
          </div>
          @if (auth.githubUsuario()) {
            <button class="btn btn-fantasma" type="button" (click)="auth.conectarGithub(null)">Desconectar</button>
          } @else {
            <a class="btn btn-secundario" routerLink="/github"><app-icone nome="github" [tamanho]="16" /> Conectar</a>
          }
        </div>
      </section>

      <section class="painel">
        <div class="secao-cab"><h2>Seus dados</h2></div>
        <div class="preferencia">
          <div>
            <strong>Exportar dados</strong>
            <p class="suave">Baixe suas trilhas, módulos, notas e sessões de foco em um arquivo JSON.</p>
          </div>
          <button class="btn btn-secundario" type="button" (click)="exportar()"><app-icone nome="download" [tamanho]="16" /> Exportar</button>
        </div>
        <div class="preferencia">
          <div>
            <strong>Seu curso</strong>
            <p class="suave">{{ curso.curso()?.nome ?? 'Nenhum escolhido. Escolha para receber sugestões de matérias e temas.' }}</p>
          </div>
          <button class="btn btn-secundario" type="button" (click)="sugestoesAbertas.set(true)">{{ curso.curso() ? 'Ver sugestões' : 'Escolher' }}</button>
        </div>
      </section>

      @if (auth.modoNuvem) {
        <section class="painel">
          <div class="preferencia">
            <div>
              <strong>Sair da conta</strong>
              <p class="suave">Seus dados continuam salvos na nuvem.</p>
            </div>
            <button class="btn btn-perigo" type="button" (click)="sair()"><app-icone nome="sair" [tamanho]="16" /> Sair</button>
          </div>
        </section>
      }
    </div>

    @if (sugestoesAbertas()) {
      <app-folha titulo="Sugestões do seu curso" rotulo="Matérias e temas" (fechar)="sugestoesAbertas.set(false)">
        <app-sugestoes-curso (adicionadas)="sugestoesAbertas.set(false)" />
      </app-folha>
    }
  `,
  styles: `
    .secoes { display: grid; gap: 16px; max-width: 860px; }
    .secao-cab { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
    .form { display: grid; gap: 16px; grid-template-columns: 1fr 1fr; }
    .form > div, .form > p { grid-column: 1 / -1; }
    .preferencia { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px 24px; padding: 16px 0; border-top: 1px solid var(--borda); }
    .secao-cab + .preferencia, .painel > .preferencia:first-child { border-top: 0; padding-top: 0; }
    .preferencia > div:first-child { flex: 1 1 280px; }
    .preferencia strong { font-weight: 600; }
    .preferencia p { font-size: .86rem; margin-top: 2px; }
    @media (max-width: 640px) { .form { grid-template-columns: 1fr; } }
  `,
})
export class ContaComponent {
  protected auth = inject(AuthService);
  protected foco = inject(FocoService);
  protected tema = inject(TemaService);
  private trilhas = inject(TrilhasService);
  private aviso = inject(AvisoService);
  private router = inject(Router);

  protected opcoesMeta = OPCOES_META_HORAS;
  protected nome = this.auth.nome();
  protected salvandoNome = signal(false);
  protected sugestoesAbertas = signal(false);
  protected curso = inject(CursoService);

  async salvarNome(): Promise<void> {
    this.salvandoNome.set(true);
    const erro = await this.auth.atualizarPerfil({ nome: this.nome.trim() });
    this.salvandoNome.set(false);
    this.aviso.mostrar(erro ?? 'Nome atualizado.');
  }

  async definirMeta(horas: number): Promise<void> {
    await this.foco.definirMeta(horas);
    this.aviso.mostrar(`Meta semanal: ${horas} h.`);
  }

  exportar(): void {
    const dados = {
      exportadoEm: new Date().toISOString(),
      conta: { nome: this.auth.nome(), email: this.auth.email() },
      trilhas: this.trilhas.trilhas(),
      sessoesFoco: this.foco.sessoes(),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `trilha-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async sair(): Promise<void> {
    await this.auth.sair();
    this.router.navigate(['/entrar']);
  }
}
