/** Número de uma versão do app, gravado no build por scripts/versao.mjs. */
export interface InfoVersao {
  /** Versão no formato 1.2.0 (vem do package.json). */
  numero: string;
  /** Dia do build, AAAA-MM-DD. */
  data: string;
  /** Commit do GitHub (7 letras), quando o build é na Vercel. */
  commit?: string;
}

/** "1.2.0 · 6 de nov. de 2026" */
export function rotuloVersao(v: InfoVersao): string {
  const [a, m, d] = v.data.split('-').map(Number);
  const dia = a ? new Date(a, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  return dia ? `${v.numero} · ${dia}` : v.numero;
}

/** Lê o appData que o service worker devolve (pode faltar em versões antigas). */
export function lerVersao(appData: unknown): InfoVersao | null {
  const d = appData as Partial<InfoVersao> | undefined;
  return d && typeof d.numero === 'string' ? { numero: d.numero, data: String(d.data ?? ''), commit: d.commit } : null;
}
