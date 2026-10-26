import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TelaDivididaComponent } from '../../shared/tela-dividida.component';

type Modo = 'entrar' | 'criar' | 'recuperar';

@Component({
  selector: 'app-entrar',
  imports: [ReactiveFormsModule, TelaDivididaComponent],
  template: `
    <app-tela-dividida>
      <p class="rotulo-mono acento">{{ modo() === 'criar' ? 'Criar conta' : modo() === 'recuperar' ? 'Recuperar acesso' : 'Entrar' }}</p>
      <h1>
        @switch (modo()) {
          @case ('criar') { Comece sua <em>trilha</em>. }
          @case ('recuperar') { Esqueceu a <em>senha</em>? }
          @default { Que bom te ver de <em>novo</em>. }
        }
      </h1>
      <p class="sub suave">
        @switch (modo()) {
          @case ('criar') { Seus estudos salvos na nuvem, em qualquer aparelho. }
          @case ('recuperar') { Informe seu e-mail e enviaremos um link para criar uma nova senha. }
          @default { Entre para continuar de onde parou. }
        }
      </p>

      @if (modo() !== 'recuperar') {
        <div class="segmentos largura" role="tablist">
          <button type="button" role="tab" [class.ativo]="modo() === 'entrar'" [attr.aria-selected]="modo() === 'entrar'" (click)="trocar('entrar')">Entrar</button>
          <button type="button" role="tab" [class.ativo]="modo() === 'criar'" [attr.aria-selected]="modo() === 'criar'" (click)="trocar('criar')">Criar conta</button>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="enviar()" class="form" novalidate>
        @if (modo() === 'criar') {
          <label class="campo-grupo"><span>Nome</span>
            <input class="campo" formControlName="nome" autocomplete="given-name" placeholder="Como quer ser chamada(o)" />
          </label>
        }
        <label class="campo-grupo"><span>E-mail</span>
          <input class="campo" type="email" formControlName="email" autocomplete="email" placeholder="voce@email.com" />
        </label>
        @if (modo() !== 'recuperar') {
          <label class="campo-grupo">
            <span class="linha-rotulo">Senha
              @if (modo() === 'entrar') { <button type="button" class="link-pequeno" (click)="trocar('recuperar')">Esqueci minha senha</button> }
            </span>
            <input class="campo" type="password" formControlName="senha" placeholder="Mínimo de 6 caracteres"
              [attr.autocomplete]="modo() === 'entrar' ? 'current-password' : 'new-password'" />
          </label>
        }

        @if (erro()) { <p class="msg erro" role="alert">{{ erro() }}</p> }
        @if (info()) { <p class="msg info" role="status">{{ info() }}</p> }

        <button class="btn btn-primario btn-lg btn-bloco" type="submit" [disabled]="enviando()">
          @if (enviando()) { Aguarde… } @else {
            @switch (modo()) { @case ('criar') { Criar conta } @case ('recuperar') { Enviar link } @default { Entrar } }
          }
        </button>

        @if (modo() === 'recuperar') {
          <button type="button" class="btn btn-fantasma btn-bloco" (click)="trocar('entrar')">Voltar para entrar</button>
        }
      </form>
    </app-tela-dividida>
  `,
  styles: `
    h1 { font-size: clamp(2rem, 3.6vw, 2.6rem); margin: 10px 0; }
    .sub { margin-bottom: 26px; }
    .largura { display: grid; grid-template-columns: 1fr 1fr; width: 100%; margin-bottom: 20px; }
    .form { display: grid; gap: 16px; }
    .linha-rotulo { display: flex; justify-content: space-between; align-items: baseline; }
    .link-pequeno { border: 0; background: none; padding: 0; color: var(--acento); font-size: .8rem; font-weight: 500; cursor: pointer; }
    .link-pequeno:hover { text-decoration: underline; }
    .msg { font-size: .86rem; padding: 10px 14px; border-radius: var(--r-2); }
    .erro { background: var(--erro-suave); color: var(--erro); }
    .info { background: var(--acento-suave); color: var(--texto); }
  `,
})
export class EntrarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  protected modo = signal<Modo>('entrar');
  protected enviando = signal(false);
  protected erro = signal<string | null>(null);
  protected info = signal<string | null>(null);

  protected form = this.fb.nonNullable.group({
    nome: [''],
    email: ['', [Validators.required, Validators.email]],
    senha: [''],
  });

  trocar(modo: Modo): void {
    this.modo.set(modo);
    this.erro.set(null);
    this.info.set(null);
  }

  async enviar(): Promise<void> {
    const { nome, email, senha } = this.form.getRawValue();
    if (this.form.controls.email.invalid) return this.erro.set('Informe um e-mail válido.');
    if (this.modo() !== 'recuperar' && senha.length < 6) return this.erro.set('A senha precisa de pelo menos 6 caracteres.');

    this.enviando.set(true);
    this.erro.set(null);
    this.info.set(null);

    if (this.modo() === 'recuperar') {
      const erro = await this.auth.recuperarSenha(email.trim());
      this.enviando.set(false);
      if (erro) this.erro.set(erro);
      else this.info.set('Se houver uma conta com esse e-mail, você vai receber um link em instantes. Confira também o spam.');
      return;
    }

    if (this.modo() === 'entrar') {
      const erro = await this.auth.entrar(email.trim(), senha);
      this.enviando.set(false);
      if (erro) this.erro.set(erro);
      else this.router.navigate(['/']);
      return;
    }

    const r = await this.auth.cadastrar(nome.trim(), email.trim(), senha);
    this.enviando.set(false);
    if (r.erro) this.erro.set(r.erro);
    else if (r.confirmar) this.info.set('Conta criada! Abra o link que enviamos para o seu e-mail e depois entre aqui.');
    else this.router.navigate(['/']);
  }
}
