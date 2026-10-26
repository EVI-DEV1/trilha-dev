import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** No modo nuvem, só entra quem estiver logado; senão vai para /entrar. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.modoNuvem) return true;
  await auth.aguardarPronto();
  return auth.usuario() ? true : router.createUrlTree(['/entrar']);
};

/** Quem já está logado não precisa ver a tela de entrar. */
export const visitanteGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.modoNuvem) return router.createUrlTree(['/']);
  await auth.aguardarPronto();
  return auth.usuario() ? router.createUrlTree(['/']) : true;
};

/** No primeiro acesso, mostra as telas de boas-vindas antes de tudo. */
export const boasVindasGuard: CanActivateFn = () => {
  let viu = true;
  try {
    viu = localStorage.getItem('trilha-dev:boas-vindas') === '1';
  } catch {
    /* sem armazenamento: não insiste nas boas-vindas */
  }
  return viu ? true : inject(Router).createUrlTree(['/boas-vindas']);
};
