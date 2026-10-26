import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CATEGORIAS, Categoria, NovaTrilha, Trilha, progressoDe, proximoModulo, rotuloCategoria } from '../../core/models/trilha.model';
import { AvisoService } from '../../core/services/aviso.service';
import { TrilhasService } from '../../core/services/trilhas.service';
import { AvatarTrilhaComponent } from '../../shared/avatar-trilha.component';
import { CabecalhoComponent } from '../../shared/cabecalho.component';
import { FolhaComponent } from '../../shared/folha.component';
import { IconeComponent } from '../../shared/icone.component';
import { TrilhaFormComponent } from '../../shared/trilha-form.component';
import { MascoteComponent } from '../../shared/mascote.component';
import { SugestoesCursoComponent } from '../../shared/sugestoes-curso.component';
import { CursoService } from '../../core/services/curso.service';

type Situacao = 'todas' | 'andamento' | 'concluidas';
type Ordem = 'recentes' | 'progresso' | 'nome';

@Component({
  selector: 'app-trilhas',
  imports: [FormsModule, RouterLink, CabecalhoComponent, AvatarTrilhaComponent, IconeComponent, FolhaComponent, TrilhaFormComponent, MascoteComponent, SugestoesCursoComponent],
  template: `
    <app-cabecalho numero="02" rotulo="Trilhas">
      <h1>Suas <em>trilhas</em></h1>
      <p>Cada trilha é um curso, formação ou matéria. Abra uma para marcar módulos, anotar e estudar com foco.</p>
      <div acoes>
        <button class="btn btn-secundario" type="button" (click)="sugestoesAbertas.set(true)">
          <app-icone nome="livro" [tamanho]="17" /> {{ curso.curso() ? 'Sugestões: ' + curso.curso()!.curto : 'Sugestões do curso' }}
        </button>
        <button class="btn btn-primario" type="button" (click)="folhaAberta.set(true)"><app-icone nome="mais" [tamanho]="17" /> Nova trilha</button>
      </div>
    </app-cabecalho>

    <div class="barra-ferramentas">
      <label class="busca">
        <app-icone nome="busca" [tamanho]="17" />
        <input type="search" [ngModel]="busca()" (ngModelChange)="busca.set($event)" placeholder="Buscar por título ou plataforma" aria-label="Buscar trilhas" />
      </label>
      <div class="segmentos" role="group" aria-label="Situação">
        @for (s of situacoes; track s.valor) {
          <button type="button" [class.ativo]="situacao() === s.valor" [attr.aria-pressed]="situacao() === s.valor" (click)="situacao.set(s.valor)">
            {{ s.rotulo }} <span class="contagem">{{ contagem()[s.valor] }}</span>
          </button>
        }
      </div>
      <select class="campo seletor" [ngModel]="categoria()" (ngModelChange)="categoria.set($event)" aria-label="Categoria">
        <option value="">Todas as categorias</option>
        @for (c of categorias; track c.valor) { <option [value]="c.valor">{{ c.rotulo }}</option> }
      </select>
      <select class="campo seletor" [ngModel]="ordem()" (ngModelChange)="ordem.set($event)" aria-label="Ordenar">
        <option value="recentes">Mais recentes</option>
        <option value="progresso">Maior progresso</option>
        <option value="nome">Nome (A–Z)</option>
      </select>
    </div>

    @if (!servico.carregado()) {
      <div class="grade-auto">
        @for (i of [1, 2, 3]; track i) { <div class="esqueleto" style="height: 220px"></div> }
      </div>
    } @else {
      <p class="rotulo-mono resultado">{{ visiveis().length }} {{ visiveis().length === 1 ? 'trilha' : 'trilhas' }}</p>
      <div class="grade-auto">
        @for (t of visiveis(); track t.id) {
          <a class="painel cartao" [routerLink]="['/trilhas', t.id]">
            <div class="cartao-topo">
              <app-avatar-trilha [trilha]="t" [tamanho]="52" />
              @if (progresso(t) === 100) {
                <span class="etiqueta sucesso">Concluída</span>
              } @else {
                <span class="etiqueta">{{ rotulo(t.categoria) }}</span>
              }
            </div>
            <h3>{{ t.titulo }}</h3>
            <p class="rotulo-mono">{{ t.plataforma || 'Sem plataforma' }}</p>
            <div class="progresso">
              <span class="barra"><span [style.width.%]="progresso(t)" [style.background]="t.cor"></span></span>
              <span class="num">{{ progresso(t) }}%</span>
            </div>
            <p class="proximo">
              @if (proximo(t); as m) {
                <span class="suave">Próximo:</span> {{ m.titulo }}
              } @else {
                <span class="suave">Todos os {{ t.modulos.length }} módulos concluídos</span>
              }
            </p>
          </a>
        } @empty {
          <div class="painel vazio">
            <app-mascote [pose]="servico.trilhas().length ? 'pensando' : 'lendo'" [tamanho]="130" />
            @if (servico.trilhas().length) {
              <h3>Nenhuma trilha encontrada</h3>
              <p>Tente outra busca ou limpe os filtros.</p>
              <button class="btn btn-secundario" type="button" (click)="limparFiltros()">Limpar filtros</button>
            } @else {
              <h3>Você ainda não tem trilhas</h3>
              <p>Escolha seu curso para receber sugestões de matérias, ou crie a primeira do zero.</p>
              <div class="acoes-vazio">
                <button class="btn btn-primario" type="button" (click)="sugestoesAbertas.set(true)">Escolher meu curso</button>
                <button class="btn btn-secundario" type="button" (click)="folhaAberta.set(true)">Criar do zero</button>
              </div>
            }
          </div>
        }
      </div>
    }

    @if (folhaAberta()) {
      <app-folha titulo="Nova trilha" rotulo="Criar" (fechar)="fechar()">
        <app-trilha-form [salvando]="salvando()" (salvar)="criar($event)" />
      </app-folha>
    }

    @if (sugestoesAbertas()) {
      <app-folha titulo="Sugestões do seu curso" rotulo="Matérias e temas" (fechar)="sugestoesAbertas.set(false)">
        <app-sugestoes-curso (adicionadas)="sugestoesAbertas.set(false)" />
      </app-folha>
    }
  `,
  styles: `
    .barra-ferramentas { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 18px; }
    .barra-ferramentas .busca { flex: 1 1 260px; }
    .seletor { width: auto; min-height: 42px; flex: 0 1 200px; background-color: var(--superficie); border-color: var(--borda); }
    .contagem { margin-left: 4px; font-family: var(--mono); font-size: .7rem; color: var(--texto-suave); }
    .resultado { margin-bottom: 12px; }
    .acoes-vazio { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }

    .cartao { display: grid; gap: 10px; align-content: start; transition: border-color .2s, transform .2s, background .2s; }
    .cartao:hover { border-color: var(--borda-forte); background: var(--superficie-2); transform: translateY(-2px); }
    .cartao-topo { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .cartao h3 { font-size: 1.25rem; }
    .progresso { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 12px; margin-top: 6px; }
    .progresso .num { font-size: .95rem; }
    .proximo { font-size: .84rem; padding-top: 10px; border-top: 1px solid var(--borda); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    @media (max-width: 767px) {
      .segmentos { order: 3; width: 100%; }
      .segmentos button { flex: 1; }
      .seletor { flex: 1 1 calc(50% - 5px); }
    }
  `,
})
export class TrilhasComponent implements OnInit {
  protected servico = inject(TrilhasService);
  private aviso = inject(AvisoService);
  private router = inject(Router);

  /** ?nova=1 na URL abre o formulário direto. */
  nova = input<string>();

  protected situacoes: { valor: Situacao; rotulo: string }[] = [
    { valor: 'todas', rotulo: 'Todas' },
    { valor: 'andamento', rotulo: 'Em andamento' },
    { valor: 'concluidas', rotulo: 'Concluídas' },
  ];
  protected categorias = CATEGORIAS;
  protected busca = signal('');
  protected situacao = signal<Situacao>('todas');
  protected categoria = signal<Categoria | ''>('');
  protected ordem = signal<Ordem>('recentes');
  protected folhaAberta = signal(false);
  protected sugestoesAbertas = signal(false);
  protected curso = inject(CursoService);
  protected salvando = signal(false);

  protected progresso = progressoDe;
  protected proximo = proximoModulo;
  protected rotulo = rotuloCategoria;

  protected contagem = computed(() => {
    const lista = this.servico.trilhas();
    const concluidas = lista.filter((t) => t.modulos.length && progressoDe(t) === 100).length;
    return { todas: lista.length, concluidas, andamento: lista.length - concluidas };
  });

  protected visiveis = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const filtradas = this.servico.trilhas().filter((t) => {
      const feita = t.modulos.length > 0 && progressoDe(t) === 100;
      if (this.situacao() === 'andamento' && feita) return false;
      if (this.situacao() === 'concluidas' && !feita) return false;
      if (this.categoria() && t.categoria !== this.categoria()) return false;
      return !termo || `${t.titulo} ${t.plataforma}`.toLowerCase().includes(termo);
    });
    const ordenar: Record<Ordem, (a: Trilha, b: Trilha) => number> = {
      recentes: (a, b) => b.id - a.id,
      progresso: (a, b) => progressoDe(b) - progressoDe(a),
      nome: (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'),
    };
    return filtradas.sort(ordenar[this.ordem()]);
  });

  ngOnInit(): void {
    if (this.nova()) this.folhaAberta.set(true);
  }

  limparFiltros(): void {
    this.busca.set('');
    this.situacao.set('todas');
    this.categoria.set('');
  }

  fechar(): void {
    this.folhaAberta.set(false);
    if (this.nova()) this.router.navigate([], { queryParams: {} });
  }

  criar(dados: NovaTrilha): void {
    this.salvando.set(true);
    this.servico.criar(dados).subscribe({
      next: (nova) => {
        this.salvando.set(false);
        this.folhaAberta.set(false);
        this.aviso.mostrar('Trilha criada.');
        this.router.navigate(['/trilhas', nova.id]);
      },
      error: () => this.salvando.set(false),
    });
  }
}
