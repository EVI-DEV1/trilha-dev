import { Injectable, computed, signal } from '@angular/core';

export type Tema = 'escuro' | 'claro';
/** O que a pessoa escolheu: um tema fixo ou seguir o sistema operacional. */
export type PreferenciaTema = Tema | 'sistema';
const CHAVE = 'trilha-dev:tema';

/** Tema claro/escuro aplicado em <html data-tema>. Padrão: segue o sistema; uma escolha manual fica salva no navegador. */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private consulta = window.matchMedia('(prefers-color-scheme: light)');
  private sistema = signal<Tema>(this.consulta.matches ? 'claro' : 'escuro');

  readonly preferencia = signal<PreferenciaTema>(this.ler());
  /** Tema efetivamente em uso. */
  readonly tema = computed<Tema>(() => {
    const p = this.preferencia();
    return p === 'sistema' ? this.sistema() : p;
  });

  constructor() {
    // Se o sistema trocar de tema (ex.: modo noturno automático), acompanha enquanto a preferência for "sistema".
    this.consulta.addEventListener('change', (e) => {
      this.sistema.set(e.matches ? 'claro' : 'escuro');
      this.aplicar();
    });
    this.aplicar();
  }

  definir(preferencia: PreferenciaTema): void {
    this.preferencia.set(preferencia);
    try {
      if (preferencia === 'sistema') localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, preferencia);
    } catch {
      /* só nesta sessão */
    }
    this.aplicar();
  }

  private aplicar(): void {
    const tema = this.tema();
    document.documentElement.dataset['tema'] = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'escuro' ? '#0a1020' : '#f3f6fb');
  }

  private ler(): PreferenciaTema {
    try {
      const salvo = localStorage.getItem(CHAVE);
      return salvo === 'claro' || salvo === 'escuro' ? salvo : 'sistema';
    } catch {
      return 'sistema';
    }
  }
}
