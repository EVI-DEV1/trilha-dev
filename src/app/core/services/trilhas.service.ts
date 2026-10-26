import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, concat, finalize, tap, toArray } from 'rxjs';
import { Modulo, NovaTrilha, Trilha, progressoDe } from '../models/trilha.model';
import { ComemoracaoService } from './comemoracao.service';
import { REPOSITORIO_TRILHAS } from '../data/repositorio-trilhas';

/**
 * Estado das trilhas com signals. Os dados vêm do repositório
 * (json-server no modo local, Supabase no modo nuvem).
 * Componentes leem os signals; só este serviço altera o estado.
 */
@Injectable({ providedIn: 'root' })
export class TrilhasService {
  private repo = inject(REPOSITORIO_TRILHAS);
  private comemoracao = inject(ComemoracaoService);

  private _trilhas = signal<Trilha[]>([]);
  readonly trilhas = this._trilhas.asReadonly();
  readonly carregando = signal(false);
  /** true depois da primeira carga (distingue "carregando" de "lista vazia"). */
  readonly carregado = signal(false);

  readonly totalModulos = computed(() => this._trilhas().reduce((soma, t) => soma + t.modulos.length, 0));
  readonly modulosConcluidos = computed(
    () => this._trilhas().flatMap((t) => t.modulos).filter((m) => m.concluido).length,
  );
  readonly progressoGeral = computed(() =>
    this.totalModulos() ? Math.round((this.modulosConcluidos() / this.totalModulos()) * 100) : 0,
  );

  carregar(): void {
    this.carregando.set(true);
    this.repo
      .listar()
      .pipe(finalize(() => { this.carregando.set(false); this.carregado.set(true); }))
      .subscribe({ next: (lista) => this._trilhas.set(lista), error: () => undefined });
  }

  /** Limpa o estado (ex.: ao sair da conta). */
  limpar(): void {
    this._trilhas.set([]);
    this.carregado.set(false);
  }

  porId(id: number): Trilha | undefined {
    return this._trilhas().find((t) => t.id === id);
  }

  alternarModulo(trilhaId: number, moduloId: number): void {
    this.alterarModulos(trilhaId, (modulos) =>
      modulos.map((m) => (m.id === moduloId ? { ...m, concluido: !m.concluido } : m)),
    );
  }

  concluirModulo(trilhaId: number, moduloId: number): void {
    this.alterarModulos(trilhaId, (modulos) => modulos.map((m) => (m.id === moduloId ? { ...m, concluido: true } : m)));
  }

  adicionarModulo(trilhaId: number, titulo: string): void {
    this.alterarModulos(trilhaId, (modulos) => [
      ...modulos,
      { id: Math.max(0, ...modulos.map((m) => m.id)) + 1, titulo, concluido: false },
    ]);
  }

  /** Salva a anotação de um módulo (texto vazio apaga a nota). */
  salvarNota(trilhaId: number, moduloId: number, nota: string): void {
    const texto = nota.trim();
    const atual = this.porId(trilhaId)?.modulos.find((m) => m.id === moduloId);
    if (!atual || (atual.nota ?? '') === texto) return;
    this.alterarModulos(trilhaId, (modulos) =>
      modulos.map((m) => {
        if (m.id !== moduloId) return m;
        const { nota: _antiga, ...resto } = m;
        return texto ? { ...resto, nota: texto } : resto;
      }),
    );
  }

  removerModulo(trilhaId: number, moduloId: number): void {
    this.alterarModulos(trilhaId, (modulos) => modulos.filter((m) => m.id !== moduloId));
  }

  criar(dados: NovaTrilha): Observable<Trilha> {
    return this.repo.criar(dados).pipe(tap((nova) => this._trilhas.update((l) => [...l, nova])));
  }

  /** Edita título, plataforma, categoria ou cor (otimista). */
  editar(id: number, dados: Partial<NovaTrilha>): Observable<unknown> {
    const original = this.porId(id);
    if (original) this.substituir({ ...original, ...dados });
    return this.repo.atualizar(id, dados).pipe(tap({ error: () => original && this.substituir(original) }));
  }

  remover(id: number): Observable<unknown> {
    return this.repo.remover(id).pipe(tap(() => this._trilhas.update((l) => l.filter((t) => t.id !== id))));
  }

  /** Cria várias trilhas, uma depois da outra (mantém a ordem). Usado pelas sugestões do curso. */
  adicionarVarias(lista: NovaTrilha[]): Observable<Trilha[]> {
    return concat(...lista.map((t) => this.criar(t))).pipe(toArray());
  }

  /**
   * Atualização otimista: a tela muda na hora, o repositório é chamado em seguida
   * e, se falhar, a trilha volta ao estado anterior.
   */
  private alterarModulos(trilhaId: number, transformar: (modulos: Modulo[]) => Modulo[]): void {
    const original = this.porId(trilhaId);
    if (!original) return;
    const atualizada: Trilha = { ...original, modulos: transformar(original.modulos) };
    this.substituir(atualizada);
    if (progressoDe(original) < 100 && progressoDe(atualizada) === 100) {
      this.comemoracao.celebrar(`"${atualizada.titulo}" concluída!`);
    }
    this.repo.atualizarModulos(trilhaId, atualizada.modulos).subscribe({ error: () => this.substituir(original) });
  }

  private substituir(trilha: Trilha): void {
    this._trilhas.update((lista) => lista.map((t) => (t.id === trilha.id ? trilha : t)));
  }
}
