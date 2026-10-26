import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TelaDivididaComponent } from '../../shared/tela-dividida.component';

/** Destino do link de "esqueci minha senha" enviado pelo Supabase. */
@Component({
  selector: 'app-redefinir-senha',
  imports: [FormsModule, TelaDivididaComponent],
  template: `
    <app-tela-dividida>
      <p class="rotulo-mono acento">Recuperar acesso</p>
      <h1>Crie uma nova <em>senha</em>.</h1>
      @if (!auth.pronto()) {
        <p class="suave">Validando o link…</p>
      } @else if (!auth.usuario()) {
        <p class="msg erro">Este link é inválido ou expirou. Peça um novo na tela de entrar.</p>
        <button class="btn btn-secundario btn-bloco" type="button" (click)="router.navigate(['/entrar'])">Ir para entrar</button>
      } @else {
        <p class="suave sub">Conta: {{ auth.email() }}</p>
        <form class="form" (ngSubmit)="salvar()">
          <label class="campo-grupo"><span>Nova senha</span>
            <input class="campo" type="password" name="senha" [(ngModel)]="senha" autocomplete="new-password" placeholder="Mínimo de 6 caracteres" />
          </label>
          <label class="campo-grupo"><span>Confirme a senha</span>
            <input class="campo" type="password" name="confirmacao" [(ngModel)]="confirmacao" autocomplete="new-password" />
          </label>
          @if (erro()) { <p class="msg erro" role="alert">{{ erro() }}</p> }
          <button class="btn btn-primario btn-lg btn-bloco" type="submit" [disabled]="salvando()">{{ salvando() ? 'Salvando…' : 'Salvar nova senha' }}</button>
        </form>
      }
    </app-tela-dividida>
  `,
  styles: `
    h1 { font-size: clamp(2rem, 3.6vw, 2.6rem); margin: 10px 0 16px; }
    .sub { margin-bottom: 20px; }
    .form { display: grid; gap: 16px; }
    .msg { font-size: .86rem; padding: 10px 14px; border-radius: var(--r-2); margin-bottom: 14px; }
    .erro { background: var(--erro-suave); color: var(--erro); }
  `,
})
export class RedefinirSenhaComponent {
  protected auth = inject(AuthService);
  protected router = inject(Router);
  protected senha = '';
  protected confirmacao = '';
  protected salvando = signal(false);
  protected erro = signal<string | null>(null);

  async salvar(): Promise<void> {
    if (this.senha.length < 6) return this.erro.set('A senha precisa de pelo menos 6 caracteres.');
    if (this.senha !== this.confirmacao) return this.erro.set('As senhas não conferem.');
    this.salvando.set(true);
    const erro = await this.auth.atualizarSenha(this.senha);
    this.salvando.set(false);
    if (erro) this.erro.set(erro);
    else this.router.navigate(['/']);
  }
}
