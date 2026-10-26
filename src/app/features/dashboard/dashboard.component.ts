import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { progressoDe, proximoModulo, rotuloCategoria } from '../../core/models/trilha.model';
import { AuthService } from '../../core/services/auth.service';
import { FeriadosService } from '../../core/services/feriados.service';
import { FocoService } from '../../core/services/foco.service';
import { TrilhasService } from '../../core/services/trilhas.service';
import { AnelProgressoComponent } from '../../shared/anel-progresso.component';
import { AvatarTrilhaComponent } from '../../shared/avatar-trilha.component';
import { CabecalhoComponent } from '../../shared/cabecalho.component';
import { IconeComponent } from '../../shared/icone.component';
import { MascoteComponent } from '../../shared/mascote.component';
import { formatarMinutos } from '../../shared/formatos';
import { FolhaComponent } from '../../shared/folha.component';
import { SugestoesCursoComponent } from '../../shared/sugestoes-curso.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CabecalhoComponent, AnelProgressoComponent, AvatarTrilhaComponent, IconeComponent, MascoteComponent, FolhaComponent, SugestoesCursoComponent],
  template: `
    <app-cabecalho numero="01" rotulo="Painel">
      <h1>{{ saudacao() }}, <em>{{ primeiroNome() }}</em>.</h1>
      <p>
        @if (servico.trilhas().length) {
          Você concluiu {{ servico.modulosConcluidos() }} de {{ servico.totalModulos() }} módulos. Continue de onde parou.
        } @else {
          Organize seus estudos em trilhas e acompanhe cada passo.
        }
      </p>
      <div acoes>
        <a class="btn btn-secundario" routerLink="/trilhas" [queryParams]="{ nova: 1 }"><app-icone nome="mais" [tamanho]="17" /> Nova trilha</a>
        <a class="btn btn-primario" routerLink="/foco"><app-icone nome="play" [tamanho]="15" /> Iniciar foco</a>
      </div>
    </app-cabecalho>

    @if (!servico.carregado()) {
      <div class="kpis">
        @for (i of [1, 2, 3, 4]; track i) { <div class="esqueleto" style="height: 112px"></div> }
      </div>
      <div class="esqueleto" style="height: 260px; margin-top: 16px"></div>
    } @else if (!servico.trilhas().length) {
      <section class="painel destaque vazio-inicial">
        <app-mascote class="bento-vazio" pose="lendo" [tamanho]="150" />
        <p class="rotulo-mono acento">Primeiros passos</p>
        <h2>Comece pela sua <em>primeira trilha</em>.</h2>
        <p class="suave">Uma trilha é um curso, formação ou matéria, dividida em módulos. Diga qual curso você faz e escolha as matérias sugeridas, ou crie a sua do zero.</p>
        <div class="acoes-vazio">
          <button class="btn btn-primario btn-lg" type="button" (click)="sugestoesAbertas.set(true)">Escolher meu curso</button>
          <a class="btn btn-secundario btn-lg" routerLink="/trilhas" [queryParams]="{ nova: 1 }">Criar do zero</a>
        </div>
      </section>
    } @else {
      <section class="kpis" aria-label="Resumo">
        <article class="painel kpi">
          <app-anel-progresso [valor]="servico.progressoGeral()" [tamanho]="56" [espessura]="5" rotulo="Progresso geral" />
          <div>
            <p class="rotulo-mono">Progresso geral</p>
            <strong class="num valor">{{ servico.progressoGeral() }}<small>%</small></strong>
          </div>
        </article>
        <article class="painel kpi">
          <div>
            <p class="rotulo-mono">Módulos concluídos</p>
            <strong class="num valor">{{ servico.modulosConcluidos() }}<small>/{{ servico.totalModulos() }}</small></strong>
            <small class="suave">
              @if (modulosPendentes()) { {{ modulosPendentes() }} {{ modulosPendentes() === 1 ? 'pendente' : 'pendentes' }} } @else { Tudo concluído 🎉 }
            </small>
          </div>
        </article>
        <article class="painel kpi">
          <div class="cheio">
            <p class="rotulo-mono">Foco · 7 dias</p>
            <strong class="num valor">{{ formatar(foco.minutosSemana()) }}</strong>
            <div class="barra" [attr.aria-label]="foco.percentualMeta() + '% da meta'"><span [style.width.%]="foco.percentualMeta()"></span></div>
            <small class="suave">Meta {{ formatar(foco.metaSemanal()) }} · {{ foco.percentualMeta() }}%</small>
          </div>
        </article>
        <article class="painel kpi">
          <div>
            <p class="rotulo-mono">Sequência</p>
            <strong class="num valor">{{ foco.sequencia() }}<small> {{ foco.sequencia() === 1 ? 'dia' : 'dias' }}</small></strong>
          </div>
          <app-icone class="chama" nome="chama" [tamanho]="26" />
        </article>
      </section>

      <div class="colunas">
        <div class="pilha">
          @if (continuar(); as c) {
            <section class="painel destaque continuar">
              <app-mascote class="bento-continuar" pose="lendo" [tamanho]="120" />
              <div class="continuar-topo">
                <p class="rotulo-mono acento">Continue de onde parou</p>
                <span class="etiqueta">{{ c.trilha.titulo }}</span>
              </div>
              <h2>{{ c.modulo.titulo }}</h2>
              <p class="suave">Módulo {{ c.indice }} de {{ c.trilha.modulos.length }} · {{ c.restantes }} {{ c.restantes === 1 ? 'restante' : 'restantes' }} nesta trilha</p>
              <div class="continuar-acoes">
                <button class="btn btn-primario" type="button" (click)="focar(c.trilha.id, c.trilha.titulo, c.modulo.id, c.modulo.titulo)">
                  <app-icone nome="relogio" [tamanho]="17" /> Estudar com foco
                </button>
                <button class="btn btn-secundario" type="button" (click)="servico.concluirModulo(c.trilha.id, c.modulo.id)">
                  <app-icone nome="check" [tamanho]="17" /> Marcar como concluído
                </button>
              </div>
            </section>
          }

          @if (plano().length) {
            <section class="painel">
              <div class="painel-cab">
                <h2>Próximos módulos</h2>
                <span class="rotulo-mono">{{ plano().length }} trilhas em andamento</span>
              </div>
              <ul class="lista-tarefas">
                @for (p of plano(); track p.trilha.id) {
                  <li>
                    <button class="check" type="button" (click)="servico.concluirModulo(p.trilha.id, p.modulo.id)" [attr.aria-label]="'Concluir ' + p.modulo.titulo">
                      <app-icone nome="check" [tamanho]="15" />
                    </button>
                    <a [routerLink]="['/trilhas', p.trilha.id]" class="tarefa-texto">
                      <strong>{{ p.modulo.titulo }}</strong>
                      <span>{{ p.trilha.titulo }}</span>
                    </a>
                    <span class="ponto" [style.background]="p.trilha.cor"></span>
                  </li>
                }
              </ul>
            </section>
          }

          <section class="painel">
            <div class="painel-cab">
              <h2>Suas trilhas</h2>
              <a class="link-texto" routerLink="/trilhas">Ver todas <span class="acento">→</span></a>
            </div>
            <ul class="lista-trilhas">
              @for (t of trilhasOrdenadas(); track t.id) {
                <li>
                  <a [routerLink]="['/trilhas', t.id]">
                    <app-avatar-trilha [trilha]="t" [tamanho]="44" />
                    <span class="lt-info">
                      <strong>{{ t.titulo }}</strong>
                      <small>{{ t.plataforma || 'Sem plataforma' }} · {{ categoria(t.categoria) }}</small>
                    </span>
                    <span class="lt-progresso">
                      <span class="barra"><span [style.width.%]="progresso(t)" [style.background]="t.cor"></span></span>
                      <small class="num">{{ progresso(t) }}%</small>
                    </span>
                  </a>
                </li>
              }
            </ul>
          </section>
        </div>

        <div class="pilha">
          <section class="painel">
            <div class="painel-cab">
              <h2>Foco na semana</h2>
              <span class="rotulo-mono">{{ formatar(foco.minutosHoje()) }} hoje</span>
            </div>
            <div class="grafico" role="img" [attr.aria-label]="'Minutos de foco nos últimos 7 dias: ' + resumoSemana()">
              @for (d of foco.semana(); track d.iso) {
                <div class="coluna" [class.hoje]="d.hoje">
                  <span class="valor-barra num">{{ d.minutos || '' }}</span>
                  <span class="barra-v" [style.height.%]="altura(d.minutos)"></span>
                  <span class="dia rotulo-mono">{{ d.rotulo }}</span>
                </div>
              }
            </div>
            <div class="meta-linha">
              <span class="suave">Meta semanal</span>
              <a routerLink="/conta" class="link-texto">{{ formatar(foco.metaSemanal()) }} · alterar</a>
            </div>
          </section>

          @if (feriado(); as f) {
            <section class="painel feriado" aria-label="Próximo feriado nacional">
              <div class="feriado-data">
                <span class="num">{{ f.data.getDate() }}</span>
                <span class="rotulo-mono">{{ mes(f.data) }}</span>
              </div>
              <div class="feriado-info">
                <p class="rotulo-mono">Próximo feriado</p>
                <strong>{{ f.nome }}</strong>
                <small class="suave">{{ quando(f.diasFaltando) }} · bom dia para adiantar uma trilha</small>
              </div>
            </section>
          }

          <section class="painel">
            <div class="painel-cab"><h2>Por categoria</h2></div>
            <ul class="categorias">
              @for (c of porCategoria(); track c.rotulo) {
                <li>
                  <span>{{ c.rotulo }}</span>
                  <span class="barra"><span [style.width.%]="c.percentual"></span></span>
                  <span class="num suave">{{ c.feitos }}/{{ c.total }}</span>
                </li>
              }
            </ul>
          </section>
        </div>
      </div>
    }

    @if (sugestoesAbertas()) {
      <app-folha titulo="Sugestões do seu curso" rotulo="Começar" (fechar)="sugestoesAbertas.set(false)">
        <app-sugestoes-curso (adicionadas)="sugestoesAbertas.set(false)" />
      </app-folha>
    }
  `,
  styles: `
    .kpis { display: grid; gap: 16px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .kpi { display: flex; align-items: center; gap: 16px; min-height: 112px; }
    .kpi .cheio { flex: 1; display: grid; gap: 6px; }
    .valor { display: block; font-size: 2rem; font-weight: 500; line-height: 1.1; margin-top: 4px; }
    .valor small { font-size: 1rem; color: var(--texto-suave); }
    .chama { margin-left: auto; color: var(--acento); }

    .colunas { display: grid; gap: 16px; grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr); margin-top: 16px; align-items: start; }

    .continuar { position: relative; overflow: hidden; display: grid; gap: 10px; padding: clamp(20px, 3vw, 30px); padding-right: clamp(20px, 3vw, 30px); }
    .continuar > :not(.bento-continuar) { position: relative; z-index: 1; max-width: calc(100% - 130px); }
    .bento-continuar { position: absolute; right: 18px; bottom: -6px; }
    .bento-vazio { justify-self: start; margin-bottom: 4px; }
    .continuar-topo { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; align-items: center; }
    .continuar h2 { font-size: clamp(1.5rem, 2.6vw, 2rem); }
    .continuar-acoes { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }

    .lista-tarefas, .lista-trilhas, .categorias { list-style: none; margin: 0; padding: 0; }
    .lista-tarefas li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid var(--borda); }
    .lista-tarefas li:first-child { border-top: 0; padding-top: 0; }
    .check { display: grid; place-items: center; width: 30px; height: 30px; flex: none; border-radius: 50%; border: 1px solid var(--borda-forte); background: transparent; color: transparent; cursor: pointer; transition: all .2s; }
    .check:hover { color: var(--sobre-acento); background: var(--acento); border-color: var(--acento); }
    .tarefa-texto { flex: 1; min-width: 0; display: grid; }
    .tarefa-texto strong { font-weight: 600; font-size: .92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tarefa-texto span { font-size: .78rem; color: var(--texto-suave); }
    .ponto { width: 8px; height: 8px; border-radius: 50%; flex: none; }

    .lista-trilhas li + li { border-top: 1px solid var(--borda); }
    .lista-trilhas a { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(90px, 160px); align-items: center; gap: 14px; padding: 10px 6px; margin: 0 -6px; border-radius: var(--r-2); transition: background .2s; }
    .lista-trilhas a:hover { background: var(--superficie-2); }
    .lt-info { display: grid; min-width: 0; }
    .lt-info strong { font-weight: 600; font-size: .94rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lt-info small { color: var(--texto-suave); font-size: .78rem; }
    .lt-progresso { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; }
    .lt-progresso small { font-size: .85rem; min-width: 3ch; text-align: right; }

    .grafico { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; height: 170px; align-items: end; }
    .coluna { display: grid; grid-template-rows: auto 1fr auto; justify-items: center; height: 100%; gap: 6px; }
    .barra-v { align-self: end; width: 100%; max-width: 28px; min-height: 4px; border-radius: 4px 4px 2px 2px; background: var(--superficie-3); transition: height .5s var(--ease); }
    .hoje .barra-v { background: var(--acento); }
    .valor-barra { font-size: .78rem; color: var(--texto-suave); min-height: 1em; }
    .hoje .dia { color: var(--acento); }
    .meta-linha { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--borda); font-size: .85rem; }

    .feriado { display: flex; align-items: center; gap: 16px; }
    .feriado-data { display: grid; place-items: center; flex: none; width: 60px; height: 64px; border-radius: var(--r-2); background: var(--acento-suave); color: var(--acento); }
    .feriado-data .num { font-size: 1.6rem; line-height: 1; }
    .feriado-data .rotulo-mono { color: var(--acento); font-size: .62rem; }
    .feriado-info { display: grid; gap: 2px; min-width: 0; }
    .feriado-info strong { font-weight: 600; }
    .feriado-info small { font-size: .8rem; }

    .categorias li { display: grid; grid-template-columns: 110px 1fr auto; align-items: center; gap: 12px; padding: 8px 0; font-size: .88rem; }

    .vazio-inicial { display: grid; gap: 14px; padding: clamp(28px, 5vw, 56px); max-width: 760px; }
    .vazio-inicial h2 { font-size: clamp(1.8rem, 3.5vw, 2.6rem); }
    .acoes-vazio { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }

    @media (max-width: 1199px) { .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 1023px) { .colunas { grid-template-columns: 1fr; } }
    @media (max-width: 520px) {
      .kpis { gap: 10px; }
      .kpi { min-height: 96px; padding: 14px; gap: 10px; }
      .kpi app-anel-progresso { display: none; }
      .valor { font-size: 1.6rem; }
      .lista-trilhas a { grid-template-columns: auto minmax(0, 1fr); }
      .lt-progresso { grid-column: 2; }
      .continuar-acoes .btn { flex: 1 1 100%; }
      .continuar > :not(.bento-continuar) { max-width: none; }
      .bento-continuar { display: none; }
    }
  `,
})
export class DashboardComponent {
  protected servico = inject(TrilhasService);
  private feriados = inject(FeriadosService);
  protected foco = inject(FocoService);
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected sugestoesAbertas = signal(false);
  protected progresso = progressoDe;
  protected categoria = rotuloCategoria;
  protected formatar = formatarMinutos;

  protected modulosPendentes = computed(() => this.servico.totalModulos() - this.servico.modulosConcluidos());
  protected feriado = toSignal(this.feriados.proximo(), { initialValue: null });

  protected primeiroNome = computed(() => this.auth.nome().split(' ')[0]);
  protected saudacao = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  });

  /** Trilhas em andamento, das mais avançadas para as menos. */
  private emAndamento = computed(() =>
    this.servico
      .trilhas()
      .filter((t) => proximoModulo(t))
      .sort((a, b) => progressoDe(b) - progressoDe(a)),
  );

  protected continuar = computed(() => {
    const trilha = this.emAndamento()[0];
    const modulo = trilha && proximoModulo(trilha);
    if (!trilha || !modulo) return null;
    return {
      trilha,
      modulo,
      indice: trilha.modulos.indexOf(modulo) + 1,
      restantes: trilha.modulos.filter((m) => !m.concluido).length,
    };
  });

  protected plano = computed(() =>
    this.emAndamento()
      .slice(1, 6)
      .flatMap((trilha) => {
        const modulo = proximoModulo(trilha);
        return modulo ? [{ trilha, modulo }] : [];
      }),
  );

  protected trilhasOrdenadas = computed(() => [...this.servico.trilhas()].sort((a, b) => progressoDe(b) - progressoDe(a)).slice(0, 6));

  protected porCategoria = computed(() => {
    const grupos = new Map<string, { rotulo: string; feitos: number; total: number }>();
    for (const t of this.servico.trilhas()) {
      const g = grupos.get(t.categoria) ?? { rotulo: rotuloCategoria(t.categoria), feitos: 0, total: 0 };
      g.total += t.modulos.length;
      g.feitos += t.modulos.filter((m) => m.concluido).length;
      grupos.set(t.categoria, g);
    }
    return [...grupos.values()].map((g) => ({ ...g, percentual: g.total ? Math.round((g.feitos / g.total) * 100) : 0 }));
  });

  private maximo = computed(() => Math.max(30, ...this.foco.semana().map((d) => d.minutos)));
  protected resumoSemana = computed(() => this.foco.semana().map((d) => `${d.rotulo} ${d.minutos}`).join(', '));

  protected altura(minutos: number): number {
    return Math.round((minutos / this.maximo()) * 100);
  }

  protected mes(data: Date): string {
    return data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }

  protected quando(dias: number): string {
    return dias === 0 ? 'É hoje' : dias === 1 ? 'Amanhã' : `Em ${dias} dias`;
  }

  focar(trilhaId: number, trilha: string, moduloId: number, modulo: string): void {
    this.foco.focarEm({ trilhaId, trilha, moduloId, modulo });
    this.router.navigate(['/foco']);
  }
}
