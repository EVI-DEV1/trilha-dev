import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AvisoService } from '../services/aviso.service';

/** Traduz erros HTTP em mensagens amigáveis, em um só lugar. */
export const erroHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const aviso = inject(AvisoService);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      aviso.mostrar(mensagemPara(erro, req.url));
      return throwError(() => erro);
    }),
  );
};

function mensagemPara(erro: HttpErrorResponse, url: string): string {
  if (erro.status === 0) {
    return url.startsWith('/api') ? 'API local fora do ar. Rode "npm run api" em outro terminal.' : 'Sem conexão com a internet.';
  }
  if (erro.status === 404) return 'Não encontrado.';
  if (erro.status === 403 && url.includes('api.github.com')) return 'Limite da API do GitHub atingido. Tente de novo em alguns minutos.';
  return `Algo deu errado (erro ${erro.status}).`;
}
