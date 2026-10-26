// Campos da resposta de GET https://brasilapi.com.br/api/feriados/v1/{ano}
export interface Feriado {
  /** Data no formato AAAA-MM-DD */
  date: string;
  name: string;
  type: 'national' | string;
}

/** Feriado já preparado para a tela. */
export interface ProximoFeriado {
  nome: string;
  data: Date;
  /** Dias inteiros a partir de hoje (0 = hoje). */
  diasFaltando: number;
}
