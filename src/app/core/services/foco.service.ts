import { Injectable, computed, inject, signal } from '@angular/core';
import { SessaoFoco, SessoesFocoRepositorio } from '../data/sessoes-foco';
import { AuthService } from './auth.service';

export type Fase = 'foco' | 'pausa';
export const OPCOES_FOCO = [15, 25, 50] as const;
export const OPCOES_META_HORAS = [2, 5, 8, 12] as const;
const CHAVE_META_LOCAL = 'trilha-dev:meta-semanal';
const CHAVE_TIMER = 'trilha-dev:timer';

/** Estado do timer salvo no aparelho (sobrevive a recarregar o app ou o celular fechá-lo). */
interface EstadoTimer {
  fase: Fase;
  restante: number;
  rodando: boolean;
  fimEm: number | null;
  minutosFoco: number;
  alvo: AlvoFoco | null;
}

/** Módulo que está sendo estudado no timer. */
export interface AlvoFoco {
  trilhaId: number;
  moduloId: number;
  modulo: string;
  trilha: string;
}

export function isoDe(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Timer Pomodoro global (continua rodando ao trocar de página) e estatísticas de foco.
 * O tempo é calculado pelo horário de término (`fimEm`), não por contagem de segundos:
 * no celular o sistema pausa o app em segundo plano, e ao voltar o tempo já aparece certo.
 * As sessões ficam no Supabase no modo nuvem, ou no navegador no modo local.
 */
@Injectable({ providedIn: 'root' })
export class FocoService {
  private sessoesRepo = inject(SessoesFocoRepositorio);
  private auth = inject(AuthService);

  readonly minutosFoco = signal<number>(25);
  readonly fase = signal<Fase>('foco');
  readonly restante = signal(25 * 60);
  readonly rodando = signal(false);
  readonly alvo = signal<AlvoFoco | null>(null);
  readonly sessoes = signal<SessaoFoco[]>([]);

  private metaLocal = signal<number>(this.lerMetaLocal());
  private intervalo?: ReturnType<typeof setInterval>;
  /** Horário (ms) em que a fase atual termina, enquanto o timer está rodando. */
  private fimEm: number | null = null;

  constructor() {
    this.restaurar();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.sincronizar();
    });
    window.addEventListener('pageshow', () => this.sincronizar());
  }

  // ----- timer -----
  readonly duracaoFase = computed(() => (this.fase() === 'foco' ? this.minutosFoco() : this.minutosPausa()) * 60);
  readonly percentual = computed(() => Math.round((1 - this.restante() / this.duracaoFase()) * 100));
  /** Há uma sessão em andamento (rodando ou pausada no meio). */
  readonly sessaoAtiva = computed(() => this.rodando() || this.restante() < this.duracaoFase());

  readonly tempo = computed(() => {
    const s = this.restante();
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  });

  // ----- estatísticas (derivadas das sessões) -----
  private porDia = computed(() => {
    const mapa: Record<string, number> = {};
    for (const s of this.sessoes()) {
      const dia = isoDe(new Date(s.criado_em));
      mapa[dia] = (mapa[dia] ?? 0) + s.minutos;
    }
    return mapa;
  });

  private porTrilha = computed(() => {
    const mapa: Record<string, number> = {};
    for (const s of this.sessoes()) if (s.trilha_id != null) mapa[s.trilha_id] = (mapa[s.trilha_id] ?? 0) + s.minutos;
    return mapa;
  });

  readonly minutosHoje = computed(() => this.porDia()[isoDe(new Date())] ?? 0);

  /** Últimos 7 dias, terminando hoje. */
  readonly semana = computed(() => {
    const mapa = this.porDia();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const iso = isoDe(d);
      return {
        iso,
        dia: d.getDate(),
        rotulo: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        minutos: mapa[iso] ?? 0,
        hoje: i === 6,
      };
    });
  });

  readonly minutosSemana = computed(() => this.semana().reduce((soma, d) => soma + d.minutos, 0));
  readonly minutosTotal = computed(() => this.sessoes().reduce((soma, s) => soma + s.minutos, 0));

  /** Meta de minutos nos últimos 7 dias (no perfil do usuário, ou no navegador). */
  readonly metaSemanal = computed(() => {
    const daConta = Number(this.auth.usuario()?.user_metadata?.['meta_semanal']);
    return daConta > 0 ? daConta : this.metaLocal();
  });
  readonly percentualMeta = computed(() => Math.min(100, Math.round((this.minutosSemana() / this.metaSemanal()) * 100)));

  /** Dias seguidos com pelo menos uma sessão (hoje ainda pode entrar). */
  readonly sequencia = computed(() => {
    const mapa = this.porDia();
    const d = new Date();
    if (!mapa[isoDe(d)]) d.setDate(d.getDate() - 1);
    let dias = 0;
    while (mapa[isoDe(d)]) {
      dias++;
      d.setDate(d.getDate() - 1);
    }
    return dias;
  });

  carregar(): void {
    this.sessoesRepo.listar().subscribe({ next: (lista) => this.sessoes.set(lista), error: () => undefined });
  }

  limpar(): void {
    this.reiniciar();
    this.alvo.set(null);
    this.sessoes.set([]);
  }

  minutosDaTrilha(trilhaId: number): number {
    return this.porTrilha()[trilhaId] ?? 0;
  }

  focarEm(alvo: AlvoFoco | null): void {
    this.alvo.set(alvo);
    this.salvar();
  }

  async definirMeta(horas: number): Promise<void> {
    const minutos = horas * 60;
    this.metaLocal.set(minutos);
    try {
      localStorage.setItem(CHAVE_META_LOCAL, String(minutos));
    } catch {
      /* só em memória */
    }
    if (this.auth.modoNuvem) await this.auth.atualizarPerfil({ meta_semanal: minutos });
  }

  escolherDuracao(minutos: number): void {
    if (this.rodando()) return;
    this.minutosFoco.set(minutos);
    if (this.fase() === 'foco') this.restante.set(minutos * 60);
    this.salvar();
  }

  iniciar(): void {
    if (this.rodando()) return;
    this.pedirPermissaoNotificacao();
    this.fimEm = Date.now() + this.restante() * 1000;
    this.rodando.set(true);
    this.ligarRelogio();
    this.salvar();
  }

  pausar(): void {
    if (this.rodando()) this.sincronizar();
    clearInterval(this.intervalo);
    this.fimEm = null;
    this.rodando.set(false);
    this.salvar();
  }

  alternar(): void {
    this.rodando() ? this.pausar() : this.iniciar();
  }

  reiniciar(): void {
    this.pausar();
    this.fase.set('foco');
    this.restante.set(this.minutosFoco() * 60);
    this.salvar();
  }

  /** Encerra a fase atual agora (registra os minutos já focados). */
  pular(): void {
    if (this.rodando()) this.sincronizar();
    if (this.fase() === 'foco') {
      const focados = Math.floor((this.duracaoFase() - this.restante()) / 60);
      if (focados > 0) this.registrar(focados);
    }
    this.trocarFase();
    if (this.rodando()) this.fimEm = Date.now() + this.duracaoFase() * 1000;
    this.salvar();
  }


  private minutosPausa(): number {
    return this.minutosFoco() >= 50 ? 10 : 5;
  }

  private ligarRelogio(): void {
    clearInterval(this.intervalo);
    this.intervalo = setInterval(() => this.sincronizar(), 1000);
  }

  /**
   * Acerta o tempo pelo relógio. Se uma ou mais fases terminaram enquanto o app
   * estava em segundo plano, registra o foco concluído e avança as fases.
   * Uma pausa que terminou com o app fechado não inicia outro foco sozinha:
   * o timer espera no começo do próximo ciclo.
   */
  private sincronizar(): void {
    if (!this.rodando() || this.fimEm == null) return;
    const agora = Date.now();
    let mudou = false;
    let terminouFoco = false;
    while (this.rodando() && this.fimEm != null && agora >= this.fimEm) {
      const atrasado = agora - this.fimEm > 2000;
      terminouFoco = this.fase() === 'foco';
      if (terminouFoco) this.registrar(this.minutosFoco());
      this.trocarFase();
      mudou = true;
      if (!terminouFoco && atrasado) {
        clearInterval(this.intervalo);
        this.fimEm = null;
        this.rodando.set(false);
      } else {
        this.fimEm += this.duracaoFase() * 1000;
      }
    }
    if (this.fimEm != null) this.restante.set(Math.max(0, Math.ceil((this.fimEm - agora) / 1000)));
    if (mudou) {
      this.notificar(
        terminouFoco ? 'Ciclo de foco concluído' : 'Pausa encerrada',
        terminouFoco ? `Hora de uma pausa de ${this.minutosPausa()} min.` : `Mais ${this.minutosFoco()} min de foco${this.alvo() ? ' em ' + this.alvo()!.modulo : ''}.`,
      );
      this.salvar();
    }
  }

  private trocarFase(): void {
    this.fase.set(this.fase() === 'foco' ? 'pausa' : 'foco');
    this.restante.set(this.duracaoFase());
  }

  private salvar(): void {
    const estado: EstadoTimer = {
      fase: this.fase(),
      restante: this.restante(),
      rodando: this.rodando(),
      fimEm: this.fimEm,
      minutosFoco: this.minutosFoco(),
      alvo: this.alvo(),
    };
    try {
      localStorage.setItem(CHAVE_TIMER, JSON.stringify(estado));
    } catch {
      /* só em memória */
    }
  }

  private restaurar(): void {
    let estado: EstadoTimer | null = null;
    try {
      estado = JSON.parse(localStorage.getItem(CHAVE_TIMER) ?? 'null');
    } catch {
      estado = null;
    }
    if (!estado) return;
    this.minutosFoco.set(estado.minutosFoco || 25);
    this.fase.set(estado.fase === 'pausa' ? 'pausa' : 'foco');
    this.restante.set(estado.restante > 0 ? estado.restante : this.duracaoFase());
    this.alvo.set(estado.alvo ?? null);
    if (estado.rodando && estado.fimEm) {
      this.fimEm = estado.fimEm;
      this.rodando.set(true);
      this.ligarRelogio();
      this.sincronizar();
    }
  }

  private registrar(minutos: number): void {
    const alvo = this.alvo();
    const sessao = { minutos, trilha_id: alvo?.trilhaId ?? null, modulo_id: alvo?.moduloId ?? null };
    this.sessoes.update((l) => [...l, { ...sessao, criado_em: new Date().toISOString() }]);
    this.sessoesRepo.registrar(sessao);
  }

  private pedirPermissaoNotificacao(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => undefined);
    }
  }

  private notificar(titulo: string, corpo: string): void {
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      /* sem vibração */
    }
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const opcoes = { body: corpo, icon: 'icons/icone-192.png', tag: 'trilha-foco' };
    // No celular (inclusive o app instalado no iPhone) a notificação precisa sair pelo service worker.
    const sw = navigator.serviceWorker;
    if (sw?.controller) {
      sw.ready.then((r) => r.showNotification(titulo, opcoes)).catch(() => undefined);
      return;
    }
    try {
      new Notification(titulo, opcoes);
    } catch {
      /* navegador sem suporte ao construtor */
    }
  }

  private lerMetaLocal(): number {
    try {
      return Number(localStorage.getItem(CHAVE_META_LOCAL)) || 300;
    } catch {
      return 300;
    }
  }
}
