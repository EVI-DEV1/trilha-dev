import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FocoService, OPCOES_FOCO } from '../../core/services/foco.service';
import { TrilhasService } from '../../core/services/trilhas.service';
import { RelogioBentoComponent } from '../../shared/relogio-bento.component';
import { CabecalhoComponent } from '../../shared/cabecalho.component';
import { IconeComponent } from '../../shared/icone.component';
import { MascoteComponent } from '../../shared/mascote.component';
import { formatarMinutos } from '../../shared/formatos';

@Component({
  selector: 'app-foco',
  imports: [FormsModule, RouterLink, CabecalhoComponent, RelogioBentoComponent, IconeComponent, MascoteComponent],
  template: `
    <app-cabecalho numero="03" rotulo="Foco">
      <h1>Modo <em>foco</em></h1>
      <p>Sessões no método Pomodoro. O timer continua rodando enquanto você navega, e cada sessão fica registrada no seu histórico.</p>
    </app-cabecalho>

    <div class="colunas">
      <section class="painel destaque relogio" aria-label="Timer">
        <div class="segmentos" role="radiogroup" aria-label="Duração do foco">
          @for (m of opcoes; track m) {
            <button type="button" role="radio" [class.ativo]="foco.minutosFoco() === m" [attr.aria-checked]="foco.minutosFoco() === m"
              [disabled]="foco.rodando()" (click)="foco.escolherDuracao(m)">{{ m }} min</button>
          }
        </div>

        <app-relogio-bento [valor]="foco.percentual()" [rodando]="foco.rodando()" [pausa]="foco.fase() === 'pausa'">
          <span class="etiqueta" [class.acento]="foco.fase() === 'foco'" [class.sucesso]="foco.fase() === 'pausa'">{{ foco.fase() === 'foco' ? 'Foco' : 'Pausa' }}</span>
          <time class="tempo">{{ foco.tempo() }}</time>
          <span class="rotulo-mono">{{ foco.rodando() ? 'em andamento' : 'pausado' }}</span>
        </app-relogio-bento>

        <div class="controles">
          <button class="btn-icone grande" type="button" (click)="foco.reiniciar()" aria-label="Reiniciar" title="Reiniciar"><app-icone nome="reiniciar" [tamanho]="20" /></button>
          <button class="play" type="button" (click)="foco.alternar()" [attr.aria-label]="foco.rodando() ? 'Pausar' : 'Iniciar'">
            <app-icone [nome]="foco.rodando() ? 'pausa' : 'play'" [tamanho]="28" [espessura]="2" />
          </button>
          <button class="btn-icone grande" type="button" (click)="foco.pular()" aria-label="Encerrar fase" title="Encerrar fase e registrar"><app-icone nome="pular" [tamanho]="20" /></button>
        </div>
      </section>

      <div class="pilha">
        <section class="painel estudando">
          <app-mascote class="bento" [pose]="foco.rodando() ? 'foco' : 'lendo'" [tamanho]="84" />
          <p class="rotulo-mono acento">Estudando agora</p>
          <label class="sr-only" for="alvo">Módulo em estudo</label>
          <select id="alvo" class="campo seletor-alvo" [ngModel]="chaveAlvo()" (ngModelChange)="escolherAlvo($event)">
            <option value="">Sessão livre (sem módulo)</option>
            @for (t of trilhasComPendentes(); track t.id) {
              <optgroup [label]="t.titulo">
                @for (m of t.pendentes; track m.id) { <option [value]="t.id + ':' + m.id">{{ m.titulo }}</option> }
              </optgroup>
            }
          </select>
          @if (foco.alvo(); as a) {
            <div class="alvo-info">
              <a [routerLink]="['/trilhas', a.trilhaId]" class="suave">{{ a.trilha }} →</a>
              @if (alvoConcluido()) {
                <span class="etiqueta sucesso">Concluído</span>
              } @else {
                <button class="btn btn-secundario btn-sm" type="button" (click)="concluirAlvo()"><app-icone nome="check" [tamanho]="15" /> Concluir módulo</button>
              }
            </div>
          }
        </section>

        <section class="painel estatisticas">
          <div><p class="rotulo-mono">Hoje</p><strong class="num">{{ formatar(foco.minutosHoje()) }}</strong></div>
          <div><p class="rotulo-mono">7 dias</p><strong class="num">{{ formatar(foco.minutosSemana()) }}</strong></div>
          <div><p class="rotulo-mono">Sequência</p><strong class="num">{{ foco.sequencia() }}d</strong></div>
          <div class="meta">
            <div class="meta-topo"><span class="suave">Meta semanal</span><span class="num">{{ foco.percentualMeta() }}%</span></div>
            <div class="barra"><span [style.width.%]="foco.percentualMeta()"></span></div>
            <a class="link-texto" routerLink="/conta">{{ formatar(foco.metaSemanal()) }} · alterar</a>
          </div>
        </section>

        <section class="painel">
          <div class="painel-cab"><h2>Sessões recentes</h2></div>
          <ul class="sessoes">
            @for (s of recentes(); track $index) {
              <li>
                <span class="num">{{ s.minutos }} min</span>
                <span class="suave">{{ s.trilha }}</span>
                <span class="rotulo-mono">{{ s.quando }}</span>
              </li>
            } @empty {
              <li class="suave">Nenhuma sessão ainda. Inicie o timer para registrar a primeira.</li>
            }
          </ul>
        </section>
      </div>
    </div>
  `,
  styles: `
    .colunas { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
    .relogio { display: grid; justify-items: center; gap: 26px; padding: clamp(24px, 4vw, 44px) 20px; }
    app-relogio-bento { margin: 6px 0 -6px; }
    .tempo { font-family: var(--serif); font-size: clamp(2.6rem, 11vw, 3.9rem); font-weight: 500; letter-spacing: -.02em; line-height: 1; font-variant-numeric: tabular-nums; }
    .controles { display: flex; align-items: center; gap: 22px; }
    .btn-icone.grande { width: 50px; height: 50px; border-radius: 50%; border-color: var(--borda-forte); }
    .play { display: grid; place-items: center; width: 76px; height: 76px; border-radius: 50%; border: 0; background: var(--acento); color: var(--sobre-acento); cursor: pointer; box-shadow: 0 12px 32px rgb(91 141 239 / 35%); transition: transform .12s, background .2s; }
    .play:hover { background: var(--acento-claro); }
    .play:active { transform: scale(.96); }
    .segmentos button:disabled { opacity: .45; cursor: not-allowed; }

    .estudando { position: relative; padding-right: 110px; }
    .bento { position: absolute; right: 14px; top: 10px; }
    .seletor-alvo { margin-top: 10px; }
    @media (max-width: 420px) { .estudando { padding-right: 20px; } .bento { display: none; } }
    .alvo-info { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 12px; font-size: .86rem; }

    .estatisticas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .estatisticas strong { display: block; font-size: 1.6rem; font-weight: 500; margin-top: 4px; }
    .meta { grid-column: 1 / -1; display: grid; gap: 8px; padding-top: 14px; border-top: 1px solid var(--borda); }
    .meta-topo { display: flex; justify-content: space-between; font-size: .86rem; }
    .meta .link-texto { justify-self: start; }

    .sessoes { list-style: none; margin: 0; padding: 0; }
    .sessoes li { display: grid; grid-template-columns: 64px 1fr auto; gap: 10px; align-items: center; padding: 10px 0; border-top: 1px solid var(--borda); font-size: .88rem; }
    .sessoes li:first-child { border-top: 0; padding-top: 0; }
    .sessoes li:only-child { display: block; }
    .sessoes .suave { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    @media (max-width: 1023px) { .colunas { grid-template-columns: 1fr; } }
  `,
})
export class FocoComponent {
  protected foco = inject(FocoService);
  private trilhas = inject(TrilhasService);
  protected opcoes = OPCOES_FOCO;
  protected formatar = formatarMinutos;

  protected trilhasComPendentes = computed(() =>
    this.trilhas
      .trilhas()
      .map((t) => ({ id: t.id, titulo: t.titulo, pendentes: t.modulos.filter((m) => !m.concluido) }))
      .filter((t) => t.pendentes.length),
  );

  protected chaveAlvo = computed(() => {
    const a = this.foco.alvo();
    return a ? `${a.trilhaId}:${a.moduloId}` : '';
  });

  protected alvoConcluido = computed(() => {
    const a = this.foco.alvo();
    return !!a && !!this.trilhas.porId(a.trilhaId)?.modulos.find((m) => m.id === a.moduloId)?.concluido;
  });

  protected recentes = computed(() => {
    const nomes = new Map(this.trilhas.trilhas().map((t) => [t.id, t.titulo]));
    return [...this.foco.sessoes()]
      .reverse()
      .slice(0, 6)
      .map((s) => ({
        minutos: s.minutos,
        trilha: (s.trilha_id != null && nomes.get(s.trilha_id)) || 'Sessão livre',
        quando: new Date(s.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      }));
  });

  escolherAlvo(chave: string): void {
    if (!chave) {
      this.foco.focarEm(null);
      return;
    }
    const [trilhaId, moduloId] = chave.split(':').map(Number);
    const trilha = this.trilhas.porId(trilhaId);
    const modulo = trilha?.modulos.find((m) => m.id === moduloId);
    if (trilha && modulo) this.foco.focarEm({ trilhaId, trilha: trilha.titulo, moduloId, modulo: modulo.titulo });
  }

  concluirAlvo(): void {
    const a = this.foco.alvo();
    if (a) this.trilhas.concluirModulo(a.trilhaId, a.moduloId);
  }
}
