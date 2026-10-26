import { Injectable, inject } from '@angular/core';
import { Observable, defer, map, of } from 'rxjs';
import { AvisoService } from '../services/aviso.service';
import { MODO_NUVEM, supabase } from './supabase';

/** Uma sessão de foco registrada (minutos estudados num momento). */
export interface SessaoFoco {
  minutos: number;
  trilha_id: number | null;
  modulo_id: number | null;
  criado_em: string;
}

const CHAVE_LOCAL = 'trilha-dev:sessoes';

/**
 * Onde as sessões de foco ficam salvas:
 * - modo nuvem: tabela "sessoes_foco" no Supabase (sincroniza entre aparelhos);
 * - modo local: localStorage do navegador.
 */
@Injectable({ providedIn: 'root' })
export class SessoesFocoRepositorio {
  private aviso = inject(AvisoService);

  /** Sessões dos últimos `dias` dias. */
  listar(dias = 120): Observable<SessaoFoco[]> {
    const desde = new Date(Date.now() - dias * 86_400_000).toISOString();
    if (!MODO_NUVEM) return of(this.lerLocal().filter((s) => s.criado_em >= desde));
    return defer(async () =>
      (await supabase()).from('sessoes_foco').select('minutos, trilha_id, modulo_id, criado_em').gte('criado_em', desde).order('criado_em'),
    ).pipe(
      map((r) => {
        if (r.error) {
          const faltaTabela = r.error.code === '42P01' || r.error.code === 'PGRST205';
          this.aviso.mostrar(faltaTabela ? 'Tabela "sessoes_foco" não encontrada. Rode o supabase/schema.sql.' : `Supabase: ${r.error.message}`);
          throw r.error;
        }
        return (r.data ?? []) as SessaoFoco[];
      }),
    );
  }

  registrar(sessao: Omit<SessaoFoco, 'criado_em'>): void {
    const completa: SessaoFoco = { ...sessao, criado_em: new Date().toISOString() };
    if (!MODO_NUVEM) {
      this.salvarLocal([...this.lerLocal(), completa]);
      return;
    }
    supabase()
      .then((sb) => sb.from('sessoes_foco').insert(sessao))
      .then(({ error }) => {
        if (error) this.aviso.mostrar('Não foi possível salvar a sessão de foco. Ela ficou só neste aparelho.');
      });
  }

  private lerLocal(): SessaoFoco[] {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_LOCAL) ?? '[]');
    } catch {
      return [];
    }
  }

  private salvarLocal(lista: SessaoFoco[]): void {
    try {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify(lista.slice(-2000)));
    } catch {
      /* sem armazenamento */
    }
  }
}
