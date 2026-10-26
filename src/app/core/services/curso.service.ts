import { Injectable, computed, inject, signal } from '@angular/core';
import { Curso, cursoPorId } from '../data/cursos';
import { AuthService } from './auth.service';

const CHAVE = 'trilha-dev:curso';

/** Curso que a pessoa faz: guardado na conta (modo nuvem) ou no navegador (modo local). */
@Injectable({ providedIn: 'root' })
export class CursoService {
  private auth = inject(AuthService);
  private local = signal<string | null>(lerLocal());

  readonly cursoId = computed<string | null>(() => {
    if (!this.auth.modoNuvem) return this.local();
    const id = this.auth.usuario()?.user_metadata?.['curso'];
    return typeof id === 'string' && id ? id : null;
  });

  readonly curso = computed<Curso | undefined>(() => cursoPorId(this.cursoId()));

  /** Salva o curso escolhido. Retorna uma mensagem de erro, ou null se deu certo. */
  async escolher(id: string): Promise<string | null> {
    if (!this.auth.modoNuvem) {
      this.local.set(id);
      try {
        localStorage.setItem(CHAVE, id);
      } catch {
        /* só nesta sessão */
      }
      return null;
    }
    return this.auth.atualizarPerfil({ curso: id });
  }
}

function lerLocal(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}
