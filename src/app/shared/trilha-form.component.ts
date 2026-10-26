import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImportarCursoService, separarModulos } from '../core/data/importar-curso';
import { CATEGORIAS, CORES_TRILHA, Categoria, NovaTrilha } from '../core/models/trilha.model';
import { IconeComponent } from './icone.component';

/** Formulário de trilha, usado para criar (com módulos) e para editar (sem módulos). */
@Component({
  selector: 'app-trilha-form',
  imports: [ReactiveFormsModule, IconeComponent],
  template: `
    <form class="form" [formGroup]="form" (ngSubmit)="enviar()" novalidate>
      @if (comModulos()) {
        <div class="importar">
          <p class="importar-tit"><app-icone nome="download" [tamanho]="16" /> Importar do link do curso</p>
          <div class="importar-linha">
            <input class="campo" #link type="url" inputmode="url" placeholder="Cole o link: playlist do YouTube, Udemy, Alura, DIO…"
              aria-label="Link do curso" (keydown.enter)="$event.preventDefault(); importar(link.value)" />
            <button class="btn btn-secundario" type="button" (click)="importar(link.value)" [disabled]="importando()">
              {{ importando() ? 'Lendo…' : 'Importar' }}
            </button>
          </div>
          @if (msgImport(); as m) { <small [class.campo-erro]="m.erro" [class.campo-ok]="!m.erro">{{ m.texto }}</small> }
          @else { <small class="campo-dica">O Bento preenche título e módulos. Se a página exigir login, copie a lista de aulas e cole em “Módulos”.</small> }
        </div>
      }

      <label class="campo-grupo">
        <span>Título da trilha</span>
        <input class="campo" formControlName="titulo" placeholder="Ex.: Angular Developer" maxlength="120" />
        @if (form.controls.titulo.touched && form.controls.titulo.invalid) {
          <small class="campo-erro">Use entre 3 e 120 caracteres.</small>
        }
      </label>

      <label class="campo-grupo">
        <span>Plataforma ou instituição</span>
        <input class="campo" formControlName="plataforma" placeholder="DIO, Alura, faculdade…" maxlength="60" />
      </label>

      <fieldset class="campo-grupo">
        <legend>Categoria</legend>
        <div class="chips">
          @for (c of categorias; track c.valor) {
            <button type="button" class="chip" [class.ativo]="form.controls.categoria.value === c.valor"
              [attr.aria-pressed]="form.controls.categoria.value === c.valor" (click)="form.controls.categoria.setValue(c.valor)">{{ c.rotulo }}</button>
          }
        </div>
      </fieldset>

      <fieldset class="campo-grupo">
        <legend>Cor</legend>
        <div class="cores">
          @for (c of cores; track c) {
            <button type="button" class="cor" [style.background]="c" [class.ativa]="form.controls.cor.value === c"
              [attr.aria-pressed]="form.controls.cor.value === c" [attr.aria-label]="'Cor ' + c" (click)="form.controls.cor.setValue(c)"></button>
          }
        </div>
      </fieldset>

      @if (comModulos()) {
        <label class="campo-grupo">
          <span>Módulos</span>
          <textarea class="campo" formControlName="modulos" rows="7" (paste)="aoColar($event)"
            placeholder="Um módulo por linha — ou cole aqui o conteúdo copiado do site do curso&#10;Ex.: Componentes&#10;Signals&#10;Rotas"></textarea>
          <small class="campo-dica">
            {{ totalModulos() }} {{ totalModulos() === 1 ? 'módulo' : 'módulos' }}.
            Colou um texto bagunçado? <button type="button" class="link-texto" (click)="organizar()">Organizar lista</button>
          </small>
        </label>
      }

      <div class="rodape">
        <ng-content />
        <button class="btn btn-primario btn-lg" type="submit" [disabled]="salvando()">
          {{ salvando() ? 'Salvando…' : rotuloBotao() }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .form { display: grid; gap: 20px; }
    fieldset { border: 0; margin: 0; padding: 0; }
    legend { padding: 0; margin-bottom: 8px; font-size: .82rem; font-weight: 600; color: var(--texto-2); }
    .cores { display: flex; flex-wrap: wrap; gap: 10px; }
    .cor { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--borda-forte); cursor: pointer; transition: transform .15s, box-shadow .15s; }
    .cor.ativa { box-shadow: 0 0 0 3px var(--superficie), 0 0 0 4px var(--texto); transform: scale(1.05); }
    .importar { display: grid; gap: 8px; padding: 14px; border: 1px dashed var(--borda-forte); border-radius: var(--r-3); background: var(--acento-suave); }
    .importar-tit { display: flex; align-items: center; gap: 8px; font-size: .85rem; font-weight: 600; color: var(--acento); }
    .importar-linha { display: flex; gap: 8px; }
    .importar-linha .campo { flex: 1; min-width: 0; }
    .campo-ok { font-size: .78rem; color: var(--sucesso); }
    .campo-dica .link-texto { font-size: inherit; }
    @media (max-width: 480px) { .importar-linha { flex-direction: column; } }
    .rodape { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; padding-top: 8px; }
    .rodape .btn-primario { margin-left: auto; }
  `,
})
export class TrilhaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private importador = inject(ImportarCursoService);
  protected importando = signal(false);
  protected msgImport = signal<{ texto: string; erro: boolean } | null>(null);

  inicial = input<Partial<NovaTrilha> | null>(null);
  comModulos = input(true);
  salvando = input(false);
  rotuloBotao = input('Criar trilha');
  salvar = output<NovaTrilha>();

  protected categorias = CATEGORIAS;
  protected cores = CORES_TRILHA;

  protected form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    plataforma: [''],
    categoria: ['front-end' as Categoria],
    cor: [CORES_TRILHA[0]],
    modulos: [''],
  });

  ngOnInit(): void {
    const i = this.inicial();
    if (i) {
      this.form.patchValue({
        titulo: i.titulo ?? '',
        plataforma: i.plataforma ?? '',
        categoria: i.categoria ?? 'front-end',
        cor: i.cor ?? CORES_TRILHA[0],
      });
    }
  }

  protected totalModulos(): number {
    return this.form.controls.modulos.value.split('\n').filter((l) => l.trim()).length;
  }

  async importar(link: string): Promise<void> {
    const url = link.trim();
    if (!/^https?:\/\/\S+\.\S+/i.test(url)) {
      this.msgImport.set({ texto: 'Cole um link completo, começando com https://', erro: true });
      return;
    }
    this.importando.set(true);
    this.msgImport.set(null);
    try {
      const c = await this.importador.porLink(url);
      const atual = this.form.getRawValue();
      this.form.patchValue({
        titulo: atual.titulo.trim() ? atual.titulo : c.titulo.slice(0, 120),
        plataforma: atual.plataforma.trim() ? atual.plataforma : c.plataforma.slice(0, 60),
        modulos: c.modulos.join('\n'),
      });
      this.msgImport.set({ texto: `Pronto! ${c.modulos.length} módulos importados. Revise e ajuste o que quiser.`, erro: false });
    } catch (e) {
      this.msgImport.set({ texto: e instanceof Error ? e.message : 'Não foi possível importar.', erro: true });
    } finally {
      this.importando.set(false);
    }
  }

  /** Ao colar um bloco grande (currículo copiado do site), já organiza em módulos. */
  aoColar(evento: ClipboardEvent): void {
    const texto = evento.clipboardData?.getData('text') ?? '';
    if (texto.split(/\r?\n/).length < 4) return;
    evento.preventDefault();
    const atual = this.form.controls.modulos.value.trim();
    const novos = separarModulos(texto);
    this.form.controls.modulos.setValue([atual, ...novos].filter(Boolean).join('\n'));
    this.msgImport.set({ texto: `${novos.length} módulos reconhecidos no texto colado.`, erro: false });
  }

  organizar(): void {
    this.form.controls.modulos.setValue(separarModulos(this.form.controls.modulos.value).join('\n'));
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const modulos = v.modulos
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((titulo, i) => ({ id: i + 1, titulo, concluido: false }));
    this.salvar.emit({ titulo: v.titulo.trim(), plataforma: v.plataforma.trim(), categoria: v.categoria, cor: v.cor, modulos });
  }
}
