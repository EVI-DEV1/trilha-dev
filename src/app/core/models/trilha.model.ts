export type Categoria = 'fundamentos' | 'front-end' | 'design' | 'ferramentas';

export interface Modulo {
  id: number;
  titulo: string;
  concluido: boolean;
  /** Anotações livres do módulo (links, resumo, onde parou). */
  nota?: string;
}

export interface Trilha {
  id: number;
  titulo: string;
  plataforma: string;
  categoria: Categoria;
  cor: string;
  modulos: Modulo[];
}

export type NovaTrilha = Omit<Trilha, 'id'>;

/** Percentual (0–100) de módulos concluídos de uma trilha. */
export function progressoDe(trilha: Trilha): number {
  if (!trilha.modulos.length) return 0;
  const feitos = trilha.modulos.filter((m) => m.concluido).length;
  return Math.round((feitos / trilha.modulos.length) * 100);
}

export const CATEGORIAS: { valor: Categoria; rotulo: string }[] = [
  { valor: 'front-end', rotulo: 'Front-end' },
  { valor: 'design', rotulo: 'Design' },
  { valor: 'fundamentos', rotulo: 'Fundamentos' },
  { valor: 'ferramentas', rotulo: 'Ferramentas' },
];

export function rotuloCategoria(c: Categoria): string {
  return CATEGORIAS.find((x) => x.valor === c)?.rotulo ?? c;
}

/** Paleta das trilhas, em harmonia com o tema azul. */
export const CORES_TRILHA = ['#5B8DEF', '#4FC3A1', '#F2B45A', '#E9798A', '#A78BFA', '#7DD3FC'];

export function proximoModulo(t: Trilha): Modulo | undefined {
  return t.modulos.find((m) => !m.concluido);
}
