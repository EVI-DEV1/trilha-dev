import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SILENCIOSO } from '../interceptors/erro-http.interceptor';
import { Feriado, ProximoFeriado } from '../models/feriado.model';

const DIA_MS = 24 * 60 * 60 * 1000;

/** Feriados nacionais pela BrasilAPI (pública, sem chave). */
@Injectable({ providedIn: 'root' })
export class FeriadosService {
  private http = inject(HttpClient);
  private base = environment.brasilApi;

  /** Lista de feriados nacionais de um ano. */
  doAno(ano: number): Observable<Feriado[]> {
    // SILENCIOSO: o card é um extra; se a API falhar, ele só não aparece (sem aviso de erro).
    return this.http.get<Feriado[]>(`${this.base}/feriados/v1/${ano}`, { context: new HttpContext().set(SILENCIOSO, true) });
  }

  /** Próximo feriado a partir de hoje; procura no ano seguinte se o atual já acabou. Emite null se a API falhar. */
  proximo(hoje = new Date()): Observable<ProximoFeriado | null> {
    const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const achar = (lista: Feriado[]) =>
      lista
        .map((f) => ({ nome: f.name, data: paraData(f.date) }))
        .filter((f) => f.data >= inicioDoDia)
        .sort((a, b) => a.data.getTime() - b.data.getTime())[0];

    return this.doAno(hoje.getFullYear()).pipe(
      switchMap((lista) => {
        const achado = achar(lista);
        return achado ? of(achado) : this.doAno(hoje.getFullYear() + 1).pipe(map((proximoAno) => achar(proximoAno) ?? null));
      }),
      map((f) => (f ? { ...f, diasFaltando: Math.round((f.data.getTime() - inicioDoDia.getTime()) / DIA_MS) } : null)),
      catchError(() => of(null)),
    );
  }
}

/** "2026-11-02" → data local (sem o deslocamento de fuso que new Date("2026-11-02") causaria). */
function paraData(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}
