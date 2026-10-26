import { Injectable, signal } from '@angular/core';

/** Mensagens rápidas (toast) exibidas no rodapé da tela. */
@Injectable({ providedIn: 'root' })
export class AvisoService {
  readonly mensagem = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  mostrar(texto: string, duracaoMs = 4000): void {
    clearTimeout(this.timer);
    this.mensagem.set(texto);
    this.timer = setTimeout(() => this.limpar(), duracaoMs);
  }

  limpar(): void {
    this.mensagem.set(null);
  }
}
