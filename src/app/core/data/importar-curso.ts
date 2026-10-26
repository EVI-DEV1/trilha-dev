import { Injectable } from '@angular/core';
import { MODO_NUVEM, supabase } from './supabase';

export interface CursoImportado {
  titulo: string;
  plataforma: string;
  modulos: string[];
  fonte: string;
}

/** Busca título e módulos a partir do link de um curso (Edge Function "importar-curso"). */
@Injectable({ providedIn: 'root' })
export class ImportarCursoService {
  readonly disponivel = MODO_NUVEM;

  async porLink(url: string): Promise<CursoImportado> {
    if (!MODO_NUVEM) throw new Error('A importação por link funciona com a conta na nuvem. Cole o conteúdo do curso abaixo.');
    const { data, error } = await (await supabase()).functions.invoke('importar-curso', { body: { url } });
    if (error) {
      let msg = 'Não conseguimos ler esse link.';
      try {
        const corpo = await (error as { context?: Response }).context?.json();
        if (corpo?.erro) msg = corpo.erro;
        if ((error as { context?: Response }).context?.status === 502)
          msg = 'Esse site não deixa o Bento ler a página. Abra o curso, copie a lista de aulas e cole no campo “Módulos”.';
      } catch {
        /* mantém a mensagem padrão */
      }
      throw new Error(msg);
    }
    const r = data as CursoImportado;
    if (r?.modulos) r.modulos = tirarRepeticoes(r.modulos);
    if (!r?.modulos?.length) throw new Error('Não encontramos módulos nessa página. Copie a lista de aulas do curso e cole no campo de módulos.');
    return r;
  }
}

const RUIDO = [
  /^\d+\s*(aulas?|v[ií]deos?|li[cç][oõ]es|lessons?|lectures?|itens?|items?)\b.*$/i,
  /^(\d+\s*h)?\s*\d+\s*(min|m|s)\b.*$/i,
  /^\d{1,2}:\d{2}(:\d{2})?$/,
  /^(pr[eé]-?visualizar|preview|assistir|play|conclu[ií]do|bloqueado|gr[aá]tis|free|novo|new)$/i,
  /^\d+\s*%$/,
  /^[•·\-–—*]+$/,
];

/** Transforma um texto colado (currículo copiado do site) em uma lista limpa de módulos. */
export function separarModulos(texto: string): string[] {
  const vistos = new Set<string>();
  const saida: string[] = [];
  for (const bruta of texto.split(/\r?\n/)) {
    let l = bruta
      .replace(/\t+/g, ' ')
      .replace(/^\s*[•·▪●○◦\-–—*>✓✔☐☑]+\s*/, '') // marcadores
      .replace(/\s+(\d{1,2}:\d{2}(:\d{2})?|\d+\s*min(utos)?|\d+\s*aulas?)\s*$/i, '') // duração no fim
      .replace(/\s*[•·|]\s*\d+.*$/, '') // "• 12 aulas • 1h"
      .trim();
    if (!l || l.length < 2 || RUIDO.some((r) => r.test(l))) continue;
    l = l.slice(0, 140);
    const chave = l.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    saida.push(l);
  }
  return saida.slice(0, 120);
}

/**
 * Remove pedaços que se repetem em quase todos os títulos (nome do canal, "Módulo 0", "@perfil"),
 * ex.: "Os pilares da Segurança - @Curso em Vídeo - Módulo 0" → "Os pilares da Segurança".
 */
export function tirarRepeticoes(titulos: string[]): string[] {
  const SEP = /\s+[-–—|·•]\s+/;
  const partes = titulos.map((t) => t.split(SEP).map((p) => p.trim()).filter(Boolean));
  const freq = new Map<string, number>();
  for (const ps of partes) for (const p of new Set(ps.map((x) => x.toLowerCase()))) freq.set(p, (freq.get(p) ?? 0) + 1);
  const comum = (p: string) => titulos.length >= 3 && (freq.get(p.toLowerCase()) ?? 0) >= titulos.length * 0.5;
  return partes.map((ps, i) => {
    const uteis = ps.filter((p, j) => j === 0 || (!p.includes('@') && !comum(p)));
    const primeira = uteis[0] && (comum(uteis[0]) && uteis.length > 1) ? uteis.slice(1) : uteis;
    return (primeira.join(' - ') || titulos[i]).trim();
  });
}
