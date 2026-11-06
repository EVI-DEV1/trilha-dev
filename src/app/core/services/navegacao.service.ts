import { Injectable, computed, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Botão "Voltar" do app: volta para a tela anterior dentro do Trilha.
 * Se a pessoa abriu a página direto (link, app instalado, recarregou), vai para a tela "pai"
 * em vez de sair do app: detalhe da trilha → Trilhas; demais → Painel.
 */
@Injectable({ providedIn: 'root' })
export class NavegacaoService {
  private router = inject(Router);
  private location = inject(Location);

  private navegacoes = 0;
  readonly url = signal('');

  /** Painel é a tela inicial: lá não há para onde voltar. */
  readonly podeVoltar = computed(() => {
    const caminho = this.url().split(/[?#]/)[0];
    return caminho !== '' && caminho !== '/';
  });

  constructor() {
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe((e) => {
      // Telas de acesso (entrar, boas-vindas…) zeram o histórico: "Voltar" nunca leva de volta ao login.
      this.navegacoes = /^\/(entrar|boas-vindas|redefinir-senha)/.test(e.urlAfterRedirects) ? 0 : this.navegacoes + 1;
      this.url.set(e.urlAfterRedirects);
    });
  }

  voltar(): void {
    if (this.navegacoes > 1) {
      this.location.back();
      return;
    }
    const caminho = this.url().split(/[?#]/)[0];
    this.router.navigateByUrl(/^\/trilhas\/.+/.test(caminho) ? '/trilhas' : '/', { replaceUrl: true });
  }
}
