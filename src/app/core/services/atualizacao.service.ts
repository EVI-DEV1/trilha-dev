import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Atualização do app instalado (PWA). O service worker guarda o site para funcionar offline,
 * então uma versão nova só entra quando é baixada e ativada. Este serviço procura versões
 * novas ao abrir e ao voltar para o app, e permite atualizar com um toque.
 */
@Injectable({ providedIn: 'root' })
export class AtualizacaoService {
  private sw = inject(SwUpdate);

  /** Há uma versão nova baixada, esperando para ser ativada. */
  readonly disponivel = signal(false);
  readonly verificando = signal(false);

  constructor() {
    if (!this.sw.isEnabled) return;
    this.sw.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => this.disponivel.set(true));
    // Cache corrompido (raro): recarrega para buscar tudo de novo.
    this.sw.unrecoverable.subscribe(() => location.reload());
    this.verificar();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.verificar();
    });
  }

  /** Procura uma versão nova no servidor. Retorna true se há uma pronta para instalar. */
  async verificar(): Promise<boolean> {
    if (!this.sw.isEnabled) return false;
    this.verificando.set(true);
    try {
      if (await this.sw.checkForUpdate()) this.disponivel.set(true);
    } catch {
      /* sem internet: tenta de novo depois */
    } finally {
      this.verificando.set(false);
    }
    return this.disponivel();
  }

  /** Ativa a versão nova (se houver) e recarrega o app. */
  async atualizar(): Promise<void> {
    if (this.sw.isEnabled && this.disponivel()) {
      try {
        await this.sw.activateUpdate();
      } catch {
        /* recarrega mesmo assim */
      }
    }
    location.reload();
  }
}
