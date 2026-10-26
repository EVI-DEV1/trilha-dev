import { Injectable, signal } from '@angular/core';

export type Tema = 'escuro' | 'claro';
const CHAVE = 'trilha-dev:tema';

/** Tema claro/escuro, salvo no navegador e aplicado em <html data-tema>. */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(this.ler());

  definir(tema: Tema): void {
    this.tema.set(tema);
    document.documentElement.dataset['tema'] = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'escuro' ? '#0a1020' : '#f3f6fb');
    try {
      localStorage.setItem(CHAVE, tema);
    } catch {
      /* só nesta sessão */
    }
  }

  private ler(): Tema {
    try {
      return localStorage.getItem(CHAVE) === 'claro' ? 'claro' : 'escuro';
    } catch {
      return 'escuro';
    }
  }
}
