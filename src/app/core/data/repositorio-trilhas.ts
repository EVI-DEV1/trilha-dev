import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { Observable, defer, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Modulo, NovaTrilha, Trilha } from '../models/trilha.model';
import { AvisoService } from '../services/aviso.service';
import { MODO_NUVEM, supabase } from './supabase';

/** Contrato de acesso aos dados. O resto do app não sabe de onde eles vêm. */
export interface RepositorioTrilhas {
  listar(): Observable<Trilha[]>;
  criar(dados: NovaTrilha): Observable<Trilha>;
  atualizarModulos(id: number, modulos: Modulo[]): Observable<unknown>;
  atualizar(id: number, dados: Partial<NovaTrilha>): Observable<unknown>;
  remover(id: number): Observable<unknown>;
}

/** Modo local: API REST do json-server (erros tratados pelo interceptor HTTP). */
class RepositorioJsonServer implements RepositorioTrilhas {
  private url = `${environment.apiUrl}/trilhas`;
  constructor(private http: HttpClient) {}

  listar() { return this.http.get<Trilha[]>(this.url); }
  criar(dados: NovaTrilha) { return this.http.post<Trilha>(this.url, dados); }
  atualizarModulos(id: number, modulos: Modulo[]) { return this.http.patch(`${this.url}/${id}`, { modulos }); }
  atualizar(id: number, dados: Partial<NovaTrilha>) { return this.http.patch(`${this.url}/${id}`, dados); }
  remover(id: number) { return this.http.delete(`${this.url}/${id}`); }
}

const COLUNAS = 'id, titulo, plataforma, categoria, cor, modulos';

interface RespostaSupabase<T> {
  data: T | null;
  error: { code?: string; message: string } | null;
}

/** Modo nuvem: tabela "trilhas" no Supabase, protegida por RLS (cada pessoa vê só as suas). */
class RepositorioSupabase implements RepositorioTrilhas {
  constructor(private aviso: AvisoService) {}

  listar() {
    return defer(() => supabase().from('trilhas').select(COLUNAS).order('id')).pipe(map((r) => this.dados<Trilha[]>(r)));
  }
  criar(dados: NovaTrilha) {
    return defer(() => supabase().from('trilhas').insert(dados).select(COLUNAS).single()).pipe(map((r) => this.dados<Trilha>(r)));
  }
  atualizarModulos(id: number, modulos: Modulo[]) {
    return defer(() => supabase().from('trilhas').update({ modulos }).eq('id', id)).pipe(map((r) => this.dados(r)));
  }
  atualizar(id: number, dados: Partial<NovaTrilha>) {
    return defer(() => supabase().from('trilhas').update(dados).eq('id', id)).pipe(map((r) => this.dados(r)));
  }
  remover(id: number) {
    return defer(() => supabase().from('trilhas').delete().eq('id', id)).pipe(map((r) => this.dados(r)));
  }

  private dados<T>(r: RespostaSupabase<unknown>): T {
    if (r.error) {
      const tabelaFaltando = r.error.code === '42P01' || r.error.code === 'PGRST205';
      this.aviso.mostrar(tabelaFaltando ? 'Tabela "trilhas" não encontrada. Rode o supabase/schema.sql.' : `Supabase: ${r.error.message}`);
      throw r.error;
    }
    return r.data as T;
  }
}

export const REPOSITORIO_TRILHAS = new InjectionToken<RepositorioTrilhas>('RepositorioTrilhas', {
  providedIn: 'root',
  factory: () => (MODO_NUVEM ? new RepositorioSupabase(inject(AvisoService)) : new RepositorioJsonServer(inject(HttpClient))),
});
