import { Component, computed, inject, output, signal } from '@angular/core';
import { CURSOS, Sugestao, cursoPorId, totalSugestoes } from '../core/data/cursos';
import { CORES_TRILHA, NovaTrilha, rotuloCategoria } from '../core/models/trilha.model';
import { AvisoService } from '../core/services/aviso.service';
import { CursoService } from '../core/services/curso.service';
import { TrilhasService } from '../core/services/trilhas.service';

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

/**
 * Escolha do curso + sugestões de matérias e temas daquele curso.
 * Usado dentro de <app-folha> no Início, em Trilhas e na Conta.
 */
@Component({
  selector: 'app-sugestoes-curso',
  template: `
    @if (!cursoAtual() || trocando()) {
      <p class="intro">Conte o que você estuda e o Bento sugere matérias e temas para virar trilhas.</p>
      @for (g of grupos; track g.rotulo) {
        <p class="rotulo-mono titulo-grupo">{{ g.rotulo }}</p>
        <div class="cursos">
          @for (c of g.cursos; track c.id) {
            <button type="button" class="curso" [class.ativo]="c.id === cursoAtual()?.id" (click)="escolher(c.id)">
              <strong>{{ c.nome }}</strong>
              <span>{{ total(c) }} sugestões</span>
            </button>
          }
        </div>
      }
    } @else {
    @if (cursoAtual(); as c) {
      <div class="escolhido">
        <div>
          <p class="rotulo-mono">Seu curso</p>
          <strong>{{ c.nome }}</strong>
        </div>
        <button class="link-texto" type="button" (click)="trocando.set(true)">Trocar</button>
      </div>

      <div class="contagem">
        <span class="suave">{{ marcadas().size }} de {{ disponiveis().length }} selecionadas</span>
        @if (disponiveis().length) {
          <button class="link-texto" type="button" (click)="marcarTodas()">{{ todasMarcadas() ? 'Desmarcar todas' : 'Marcar todas' }}</button>
        }
      </div>

      @for (g of c.grupos; track g.rotulo) {
        <p class="rotulo-mono titulo-grupo">{{ g.rotulo }}</p>
        <ul class="lista">
          @for (s of g.itens; track s.id) {
            <li>
              <label class="sugestao" [class.marcada]="marcadas().has(s.id)" [class.tem]="jaTem(s)">
                <input type="checkbox" [checked]="marcadas().has(s.id) || jaTem(s)" [disabled]="jaTem(s)" (change)="alternar(s.id)" />
                <span class="info">
                  <strong>{{ s.titulo }}</strong>
                  <small>{{ jaTem(s) ? 'Já está nas suas trilhas' : resumo(s) }}</small>
                </span>
                <span class="etiqueta">{{ categoria(s) }}</span>
              </label>
            </li>
          }
        </ul>
      }

      <div class="rodape">
        <button class="btn btn-primario btn-lg btn-bloco" type="button" [disabled]="!marcadas().size || salvando()" (click)="adicionar()">
          {{ salvando() ? 'Adicionando…' : textoBotao() }}
        </button>
      </div>
    }
    }
  `,
  styles: `
    :host { display: block; }
    .intro { color: var(--texto-2); margin-bottom: 6px; }
    .titulo-grupo { margin: 20px 0 10px; }
    .cursos { display: grid; gap: 8px; }
    .curso {
      display: flex; justify-content: space-between; align-items: center; gap: 12px; width: 100%;
      padding: 12px 14px; text-align: left; cursor: pointer;
      border: 1px solid var(--borda); border-radius: var(--r-2); background: var(--fundo-2); color: var(--texto);
      transition: border-color .2s, background .2s;
    }
    .curso:hover { border-color: var(--acento); }
    .curso.ativo { border-color: var(--acento); background: var(--acento-suave); }
    .curso strong { font-weight: 600; font-size: .92rem; }
    .curso span { flex: none; font-family: var(--mono); font-size: .66rem; letter-spacing: .08em; text-transform: uppercase; color: var(--texto-suave); }

    .escolhido {
      display: flex; justify-content: space-between; align-items: center; gap: 12px;
      padding: 14px 16px; border-radius: var(--r-2); background: var(--acento-suave);
    }
    .escolhido .rotulo-mono { margin-bottom: 2px; }
    .escolhido strong { font-weight: 600; }
    .contagem { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: .85rem; }

    .lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
    .sugestao {
      display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px;
      padding: 12px 14px; cursor: pointer;
      border: 1px solid var(--borda); border-radius: var(--r-2); background: var(--fundo-2);
      transition: border-color .2s, background .2s;
    }
    .sugestao:hover { border-color: var(--borda-forte); }
    .sugestao.marcada { border-color: var(--acento); background: var(--acento-suave); }
    .sugestao.tem { cursor: default; opacity: .6; }
    .sugestao input { width: 18px; height: 18px; accent-color: var(--acento); }
    .info { display: grid; gap: 2px; min-width: 0; }
    .info strong { font-weight: 600; font-size: .92rem; }
    .info small { color: var(--texto-suave); font-size: .78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .rodape { position: sticky; bottom: -28px; margin: 20px -24px -28px; padding: 14px 24px 28px; background: var(--superficie); border-top: 1px solid var(--borda); }
  `,
})
export class SugestoesCursoComponent {
  private cursos = inject(CursoService);
  private trilhas = inject(TrilhasService);
  private aviso = inject(AvisoService);

  /** Emite quantas trilhas foram adicionadas. */
  adicionadas = output<number>();

  protected grupos = CURSOS;
  protected total = totalSugestoes;
  protected trocando = signal(false);
  protected salvando = signal(false);
  protected marcadas = signal<ReadonlySet<string>>(new Set());
  /** Escolha feita agora (aparece na hora, antes de a conta terminar de salvar). */
  private escolhido = signal<string | null>(null);

  protected cursoAtual = computed(() => cursoPorId(this.escolhido() ?? this.cursos.cursoId()));

  private existentes = computed(() => new Set(this.trilhas.trilhas().map((t) => normalizar(t.titulo))));
  protected disponiveis = computed(() =>
    (this.cursoAtual()?.grupos ?? []).flatMap((g) => g.itens).filter((s) => !this.jaTem(s)),
  );
  protected todasMarcadas = computed(() => this.disponiveis().length > 0 && this.disponiveis().every((s) => this.marcadas().has(s.id)));
  protected textoBotao = computed(() => {
    const n = this.marcadas().size;
    return n === 0 ? 'Selecione as matérias' : n === 1 ? 'Adicionar 1 trilha' : `Adicionar ${n} trilhas`;
  });

  protected jaTem(s: Sugestao): boolean {
    return this.existentes().has(normalizar(s.titulo));
  }

  protected resumo(s: Sugestao): string {
    const lista = s.modulos.slice(0, 3).join(', ');
    return `${s.modulos.length} módulos · ${lista}${s.modulos.length > 3 ? '…' : ''}`;
  }

  protected categoria(s: Sugestao): string {
    return rotuloCategoria(s.categoria);
  }

  escolher(id: string): void {
    this.escolhido.set(id);
    this.trocando.set(false);
    this.marcadas.set(new Set());
    this.cursos.escolher(id).then((erro) => erro && this.aviso.mostrar(erro));
  }

  alternar(id: string): void {
    this.marcadas.update((atual) => {
      const nova = new Set(atual);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  marcarTodas(): void {
    this.marcadas.set(this.todasMarcadas() ? new Set() : new Set(this.disponiveis().map((s) => s.id)));
  }

  adicionar(): void {
    const curso = this.cursoAtual();
    if (!curso) return;
    const base = this.trilhas.trilhas().length;
    const escolhidas = this.disponiveis().filter((s) => this.marcadas().has(s.id));
    const lista: NovaTrilha[] = escolhidas.map((s, i) => ({
      titulo: s.titulo,
      plataforma: curso.curto,
      categoria: s.categoria,
      cor: CORES_TRILHA[(base + i) % CORES_TRILHA.length],
      modulos: s.modulos.map((titulo, j) => ({ id: j + 1, titulo, concluido: false })),
    }));
    this.salvando.set(true);
    this.trilhas.adicionarVarias(lista).subscribe({
      next: (criadas) => {
        this.salvando.set(false);
        this.marcadas.set(new Set());
        this.aviso.mostrar(criadas.length === 1 ? '1 trilha adicionada.' : `${criadas.length} trilhas adicionadas.`);
        this.adicionadas.emit(criadas.length);
      },
      error: () => this.salvando.set(false),
    });
  }
}
