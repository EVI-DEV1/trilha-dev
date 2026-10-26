import { Injectable, computed, signal } from '@angular/core';

interface EventoInstalar extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Plataforma = 'iphone' | 'android' | 'computador';

/** Instalação do app (PWA): guarda o convite do navegador e detecta a plataforma. */
@Injectable({ providedIn: 'root' })
export class InstalarService {
  private convite = signal<EventoInstalar | null>((window as unknown as { __trilhaInstalar?: EventoInstalar }).__trilhaInstalar ?? null);
  readonly instalado = signal(
    window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true,
  );
  readonly podeInstalar = computed(() => !!this.convite() && !this.instalado());

  readonly plataforma: Plataforma = (() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'iphone';
    if (/Android/i.test(ua)) return 'android';
    return 'computador';
  })();

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.convite.set(e as EventoInstalar);
    });
    window.addEventListener('appinstalled', () => {
      this.instalado.set(true);
      this.convite.set(null);
    });
  }

  /** Abre o convite nativo do navegador. Retorna true se a pessoa aceitou. */
  async instalar(): Promise<boolean> {
    const c = this.convite();
    if (!c) return false;
    await c.prompt();
    const { outcome } = await c.userChoice;
    this.convite.set(null);
    if (outcome === 'accepted') this.instalado.set(true);
    return outcome === 'accepted';
  }
}
