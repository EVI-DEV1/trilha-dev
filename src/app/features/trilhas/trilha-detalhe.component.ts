import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NovaTrilha, progressoDe, proximoModulo, rotuloCategoria } from '../../core/models/trilha.model';
import { AvisoService } from '../../core/services/aviso.service';
import { FocoService } from '../../core/services/foco.service';
import { TrilhasService } from '../../core/services/trilhas.service';
import { AnelProgressoComponent } from '../../shared/anel-progresso.component';
import { FolhaComponent } from '../../shared/folha.component';
import { IconeComponent } from '../../shared/icone.component';
import { TrilhaFormComponent } from '../../shared/trilha-form.component';
import { MascoteComponent } from '../../shared/mascote.component';
import { formatarMinutos } from '../../shared/formatos';

@Component({
  selector: 'app-trilha-detalhe',
  imports: [RouterLink, AnelProgressoComponent, IconeComponent, FolhaComponent, TrilhaFormComponent, MascoteComponent],
  template: `
    <nav class="migalhas rotulo-mono" aria-label="Você está em">
      <a routerLink="/trilhas">Trilhas</a> <span>/</span> <span class="atual">{{ trilha()?.titulo ?? '…' }}</span>
    </nav>

    @if (trilha(); as t) {
      <header class="topo">
        <div class="titulo">
          <p class="rotulo-mono"><span class="ponto" [style.background]="t.cor"></span>{{ categoria(t.categoria) }} · {{ t.plataforma || 'Sem plataforma' }}</p>
          <h1>{{ t.titulo }}</h1>
        </div>
        <div class="acoes">
          <button class="btn btn-secundario" type="button" (click)="editando.set(true)"><app-icone nome="editar" [tamanho]="16" /> Editar</button>
          @if (proximo(); as m) {
            <button class="btn btn-primario" type="button" (click)="focar(t.id, t.titulo, m.id, m.titulo)"><app-icone nome="relogio" [tamanho]="16" /> Estudar próximo</button>
          }
        </div>
      </header>

      <div class="colunas">
        <section class="painel modulos-painel" aria-label="Módulos">
          <div class="painel-cab">
            <h2>Módulos</h2>
            <span class="rotulo-mono">{{ feitos() }} de {{ t.modulos.length }}</span>
          </div>

          <ol class="modulos">
            @for (m of t.modulos; track m.id; let i = $index) {
              <li [class.feito]="m.concluido" [class.aberto]="notaAberta() === m.id">
                <div class="linha">
                  <button class="check" type="button" (click)="servico.alternarModulo(t.id, m.id)" [attr.aria-pressed]="m.concluido"
                    [attr.aria-label]="(m.concluido ? 'Desmarcar ' : 'Concluir ') + m.titulo">
                    @if (m.concluido) { <app-icone nome="check" [tamanho]="15" [espessura]="2.2" /> } @else { <span class="num">{{ i + 1 }}</span> }
                  </button>
                  <button class="titulo-modulo" type="button" (click)="alternarNota(m.id)" [attr.aria-expanded]="notaAberta() === m.id">
                    <span>{{ m.titulo }}</span>
                    @if (m.nota) { <app-icone class="tem-nota" nome="nota" [tamanho]="14" /> }
                  </button>
                  <div class="acoes-modulo">
                    @if (!m.concluido) {
                      <button class="btn-icone" type="button" (click)="focar(t.id, t.titulo, m.id, m.titulo)"
                        [class.ativo]="foco.alvo()?.moduloId === m.id && foco.alvo()?.trilhaId === t.id" [attr.aria-label]="'Estudar ' + m.titulo + ' com foco'" title="Estudar com foco">
                        <app-icone nome="relogio" [tamanho]="16" />
                      </button>
                    }
                    <button class="btn-icone" type="button" (click)="alternarNota(m.id)" [attr.aria-label]="'Anotações de ' + m.titulo" title="Anotações">
                      <app-icone nome="nota" [tamanho]="16" />
                    </button>
                    <button class="btn-icone remover" type="button" (click)="servico.removerModulo(t.id, m.id)" [attr.aria-label]="'Remover ' + m.titulo" title="Remover">
                      <app-icone nome="lixeira" [tamanho]="16" />
                    </button>
                  </div>
                </div>
                @if (notaAberta() === m.id) {
                  <div class="nota-area">
                    <textarea #nota class="campo" rows="4" [value]="m.nota ?? ''" placeholder="Links, resumo, dúvidas, onde você parou…"
                      (blur)="servico.salvarNota(t.id, m.id, nota.value)" aria-label="Anotações do módulo"></textarea>
                    <small class="campo-dica">Salvo automaticamente ao sair do campo.</small>
                  </div>
                }
              </li>
            } @empty {
              <li class="vazio"><p>Nenhum módulo ainda. Adicione o primeiro abaixo.</p></li>
            }
          </ol>

          <form class="novo" (submit)="adicionar($event, t.id, campo)">
            <input #campo class="campo" placeholder="Nome do novo módulo" aria-label="Nome do novo módulo" maxlength="120" />
            <button class="btn btn-secundario" type="submit"><app-icone nome="mais" [tamanho]="16" /> Adicionar</button>
          </form>
        </section>

        <aside class="pilha">
          <section class="painel destaque resumo">
            <app-anel-progresso [valor]="progresso()" [tamanho]="148" [espessura]="8" [cor]="t.cor" rotulo="Progresso da trilha">
              <span class="pct num">{{ progresso() }}<small>%</small></span>
            </app-anel-progresso>
            <dl class="numeros">
              <div><dt class="rotulo-mono">Concluídos</dt><dd class="num">{{ feitos() }}</dd></div>
              <div><dt class="rotulo-mono">Restantes</dt><dd class="num">{{ t.modulos.length - feitos() }}</dd></div>
              <div><dt class="rotulo-mono">Tempo de foco</dt><dd class="num">{{ formatar(foco.minutosDaTrilha(t.id)) }}</dd></div>
            </dl>
          </section>

          @if (proximo(); as m) {
            <section class="painel proximo-painel">
              <p class="rotulo-mono acento">Próximo módulo</p>
              <h3>{{ m.titulo }}</h3>
              <div class="proximo-acoes">
                <button class="btn btn-primario btn-sm" type="button" (click)="focar(t.id, t.titulo, m.id, m.titulo)">Estudar com foco</button>
                <button class="btn btn-fantasma btn-sm" type="button" (click)="servico.concluirModulo(t.id, m.id)">Concluir</button>
              </div>
            </section>
          }
        </aside>
      </div>

      @if (editando()) {
        <app-folha titulo="Editar trilha" rotulo="Configurações" (fechar)="editando.set(false)">
          <app-trilha-form [inicial]="t" [comModulos]="false" rotuloBotao="Salvar alterações" [salvando]="salvando()" (salvar)="salvarEdicao(t.id, $event)">
            <button class="btn btn-perigo" type="button" (click)="excluir(t.id, t.titulo)">
              <app-icone nome="lixeira" [tamanho]="16" /> {{ confirmando() ? 'Confirmar exclusão' : 'Excluir trilha' }}
            </button>
          </app-trilha-form>
        </app-folha>
      }
    } @else if (!servico.carregado()) {
      <div class="esqueleto" style="height: 80px; margin-bottom: 16px"></div>
      <div class="esqueleto" style="height: 360px"></div>
    } @else {
      <div class="painel vazio">
        <app-mascote pose="pensando" [tamanho]="130" />
        <h3>Trilha não encontrada</h3>
        <p>Ela pode ter sido excluída.</p>
        <a class="btn btn-secundario" routerLink="/trilhas">Voltar para trilhas</a>
      </div>
    }
  `,
  styles: `
    .migalhas { display: flex; gap: 8px; align-items: center; margin-bottom: 18px; }
    .migalhas a:hover { color: var(--acento); }
    .migalhas .atual { color: var(--texto-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .topo { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 16px 24px; margin-bottom: 24px; }
    .titulo { display: grid; gap: 10px; min-width: 0; }
    .titulo .rotulo-mono { display: flex; align-items: center; gap: 8px; }
    .ponto { width: 8px; height: 8px; border-radius: 50%; }
    .acoes { display: flex; flex-wrap: wrap; gap: 8px; }

    .colunas { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }

    .modulos { list-style: none; margin: 0; padding: 0; }
    .modulos li { border-top: 1px solid var(--borda); }
    .modulos li:first-child { border-top: 0; }
    .linha { display: flex; align-items: center; gap: 12px; padding: 10px 0; }
    .check { display: grid; place-items: center; width: 32px; height: 32px; flex: none; border-radius: 50%; border: 1px solid var(--borda-forte); background: transparent; color: var(--texto-suave); font-size: .85rem; cursor: pointer; transition: all .2s; }
    .check:hover { border-color: var(--acento); color: var(--acento); }
    .feito .check { background: var(--acento); border-color: var(--acento); color: var(--sobre-acento); }
    .titulo-modulo { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; border: 0; background: none; padding: 6px 0; text-align: left; font-weight: 500; cursor: pointer; }
    .titulo-modulo span { overflow-wrap: anywhere; }
    .feito .titulo-modulo span { color: var(--texto-suave); text-decoration: line-through; text-decoration-color: var(--borda-forte); }
    .tem-nota { color: var(--acento); }
    .acoes-modulo { display: flex; gap: 4px; opacity: .55; transition: opacity .2s; }
    .linha:hover .acoes-modulo, .aberto .acoes-modulo, .acoes-modulo:focus-within { opacity: 1; }
    .acoes-modulo .btn-icone { width: 34px; height: 34px; border-color: transparent; }
    .acoes-modulo .btn-icone.ativo { color: var(--acento); border-color: color-mix(in srgb, var(--acento) 40%, transparent); }
    .remover:hover { color: var(--erro) !important; }
    .nota-area { display: grid; gap: 6px; padding: 0 0 14px 44px; }
    .vazio p { color: var(--texto-suave); }

    .novo { display: flex; gap: 8px; margin-top: 14px; padding-top: 16px; border-top: 1px solid var(--borda); }

    .resumo { display: grid; justify-items: center; gap: 20px; }
    .pct { font-size: 2.2rem; }
    .pct small { font-size: 1rem; color: var(--texto-suave); }
    .numeros { width: 100%; margin: 0; display: grid; gap: 0; }
    .numeros div { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; border-top: 1px solid var(--borda); }
    .numeros dd { margin: 0; font-size: 1.15rem; }
    .proximo-painel { display: grid; gap: 10px; }
    .proximo-acoes { display: flex; gap: 8px; flex-wrap: wrap; }

    @media (max-width: 1023px) {
      .colunas { grid-template-columns: 1fr; }
      aside { order: -1; }
      .resumo { grid-template-columns: auto 1fr; justify-items: stretch; align-items: center; }
    }
    @media (max-width: 520px) {
      .acoes { width: 100%; }
      .acoes .btn { flex: 1; }
      .acoes-modulo { opacity: 1; }
      .acoes-modulo .btn-icone { width: 30px; height: 30px; }
      .nota-area { padding-left: 0; }
      .resumo { grid-template-columns: 1fr; justify-items: center; }
      .novo .btn { padding: 0 12px; }
    }
  `,
})
export class TrilhaDetalheComponent {
  protected servico = inject(TrilhasService);
  protected foco = inject(FocoService);
  private aviso = inject(AvisoService);
  private router = inject(Router);

  /** Vem do parâmetro :id da rota (withComponentInputBinding). */
  id = input.required<string>();

  protected editando = signal(false);
  protected salvando = signal(false);
  protected confirmando = signal(false);
  protected notaAberta = signal<number | null>(null);
  protected categoria = rotuloCategoria;
  protected formatar = formatarMinutos;

  protected trilha = computed(() => this.servico.trilhas().find((t) => t.id === Number(this.id())));
  protected progresso = computed(() => {
    const t = this.trilha();
    return t ? progressoDe(t) : 0;
  });
  protected feitos = computed(() => this.trilha()?.modulos.filter((m) => m.concluido).length ?? 0);
  protected proximo = computed(() => {
    const t = this.trilha();
    return t ? proximoModulo(t) : undefined;
  });

  alternarNota(moduloId: number): void {
    this.notaAberta.update((atual) => (atual === moduloId ? null : moduloId));
  }

  focar(trilhaId: number, trilha: string, moduloId: number, modulo: string): void {
    this.foco.focarEm({ trilhaId, trilha, moduloId, modulo });
    this.router.navigate(['/foco']);
  }

  adicionar(evento: Event, trilhaId: number, campo: HTMLInputElement): void {
    evento.preventDefault();
    const titulo = campo.value.trim();
    if (!titulo) return;
    this.servico.adicionarModulo(trilhaId, titulo);
    campo.value = '';
    campo.focus();
  }

  salvarEdicao(id: number, dados: NovaTrilha): void {
    const { modulos: _ignorar, ...campos } = dados;
    this.salvando.set(true);
    this.servico.editar(id, campos).subscribe({
      next: () => {
        this.salvando.set(false);
        this.editando.set(false);
        this.aviso.mostrar('Trilha atualizada.');
      },
      error: () => this.salvando.set(false),
    });
  }

  excluir(id: number, titulo: string): void {
    if (!this.confirmando()) {
      this.confirmando.set(true);
      setTimeout(() => this.confirmando.set(false), 4000);
      return;
    }
    this.servico.remover(id).subscribe(() => {
      this.editando.set(false);
      this.aviso.mostrar(`"${titulo}" foi excluída.`);
      this.router.navigate(['/trilhas']);
    });
  }
}
