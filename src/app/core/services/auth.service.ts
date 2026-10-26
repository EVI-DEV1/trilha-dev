import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { MODO_NUVEM, supabase } from '../data/supabase';

const ERROS: Record<string, string> = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail pelo link que enviamos e tente de novo.',
  'User already registered': 'Já existe uma conta com esse e-mail.',
  'Password should be at least 6 characters.': 'A senha precisa de pelo menos 6 caracteres.',
  'New password should be different from the old password.': 'A nova senha precisa ser diferente da anterior.',
  'For security purposes, you can only request this after 60 seconds.': 'Por segurança, aguarde 1 minuto antes de pedir de novo.',
};

/** Sessão do usuário. No modo local não há login: o app fica sempre "logado". */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly modoNuvem = MODO_NUVEM;
  readonly usuario = signal<User | null>(null);
  readonly pronto = signal(!MODO_NUVEM);
  readonly logado = computed(() => !this.modoNuvem || !!this.usuario());
  readonly email = computed(() => this.usuario()?.email ?? null);
  readonly nome = computed(() => {
    const meta = this.usuario()?.user_metadata;
    return (meta?.['nome'] as string | undefined) || this.email()?.split('@')[0] || environment.nomeUsuario;
  });

  private router = inject(Router);

  /** Usuário do GitHub conectado ao Bento (na conta, ou no navegador no modo local). */
  private githubLocal = signal<string | null>(lerLocal('trilha-dev:github'));
  readonly githubUsuario = computed(() => {
    if (!MODO_NUVEM) return this.githubLocal();
    const login = this.usuario()?.user_metadata?.['github'];
    return typeof login === 'string' && login ? login : null;
  });

  async conectarGithub(login: string | null): Promise<string | null> {
    if (!MODO_NUVEM) {
      this.githubLocal.set(login);
      try {
        if (login) localStorage.setItem('trilha-dev:github', login);
        else localStorage.removeItem('trilha-dev:github');
      } catch {
        /* só nesta sessão */
      }
      return null;
    }
    return this.atualizarPerfil({ github: login ?? '' });
  }
  private inicio: Promise<void> = Promise.resolve();

  constructor() {
    if (!MODO_NUVEM) return;
    this.inicio = supabase().then(async (sb) => {
      sb.auth.onAuthStateChange((evento, sessao) => {
        this.usuario.set(sessao?.user ?? null);
        // Veio pelo link de "esqueci minha senha": leva direto para criar a nova senha.
        if (evento === 'PASSWORD_RECOVERY') setTimeout(() => this.router.navigateByUrl('/redefinir-senha'));
      });
      const { data } = await sb.auth.getSession();
      this.usuario.set(data.session?.user ?? null);
      this.pronto.set(true);
    });
  }

  /** Espera a sessão salva ser lida (usado pelo guard). */
  aguardarPronto(): Promise<void> {
    return this.inicio;
  }

  /** Retorna uma mensagem de erro, ou null se deu certo. */
  async entrar(email: string, senha: string): Promise<string | null> {
    const { error } = await (await supabase()).auth.signInWithPassword({ email, password: senha });
    return error ? this.traduzir(error.message) : null;
  }

  /** Retorna { erro } ou { confirmar: true } quando o Supabase exige confirmação por e-mail. */
  async cadastrar(nome: string, email: string, senha: string): Promise<{ erro?: string; confirmar?: boolean }> {
    const { data, error } = await (await supabase()).auth.signUp({ email, password: senha, options: { data: { nome } } });
    if (error) return { erro: this.traduzir(error.message) };
    return { confirmar: !data.session };
  }

  /** Envia o e-mail de "esqueci minha senha". */
  async recuperarSenha(email: string): Promise<string | null> {
    const { error } = await (await supabase()).auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/redefinir-senha` });
    return error ? this.traduzir(error.message) : null;
  }

  /** Define uma nova senha (usado depois do link de recuperação). */
  async atualizarSenha(senha: string): Promise<string | null> {
    const { error } = await (await supabase()).auth.updateUser({ password: senha });
    return error ? this.traduzir(error.message) : null;
  }

  /** Atualiza dados do perfil (nome, meta semanal…) guardados na conta. */
  async atualizarPerfil(dados: Record<string, unknown>): Promise<string | null> {
    if (!MODO_NUVEM) return null;
    const { data, error } = await (await supabase()).auth.updateUser({ data: dados });
    if (data.user) this.usuario.set(data.user);
    return error ? this.traduzir(error.message) : null;
  }

  async sair(): Promise<void> {
    if (MODO_NUVEM) await (await supabase()).auth.signOut();
  }

  private traduzir(msg: string): string {
    return ERROS[msg] ?? msg;
  }
}

function lerLocal(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}
