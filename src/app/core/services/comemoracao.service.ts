import { Injectable, signal } from '@angular/core';

/** Dispara a animação de confete com uma mensagem (ex.: trilha concluída). */
@Injectable({ providedIn: 'root' })
export class ComemoracaoService {
  readonly mensagem = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  celebrar(texto: string): void {
    clearTimeout(this.timer);
    this.mensagem.set(null);
    // novo "tick" para reiniciar a animação mesmo se já estiver na tela
    setTimeout(() => this.mensagem.set(texto));
    this.timer = setTimeout(() => this.mensagem.set(null), 3600);
    navigator.vibrate?.([60, 40, 60, 40, 120]);
  }
}
