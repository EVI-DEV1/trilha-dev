import { NovaTrilha } from '../models/trilha.model';

const m = (...titulos: string[]) => titulos.map((titulo, i) => ({ id: i + 1, titulo, concluido: false }));
const feito = (...titulos: string[]) => titulos.map((titulo, i) => ({ id: i + 1, titulo, concluido: true }));

/** Trilhas usadas para começar rápido (botão "Adicionar exemplos"). */
export const TRILHAS_EXEMPLO: NovaTrilha[] = [
  { titulo: 'Lógica de Programação', plataforma: 'DIO', categoria: 'fundamentos', cor: '#A78BFA',
    modulos: feito('Algoritmos e pseudocódigo', 'Estruturas condicionais e de repetição', 'Vetores e funções') },
  { titulo: 'JavaScript Developer', plataforma: 'DIO', categoria: 'front-end', cor: '#F2B45A',
    modulos: feito('Fundamentos de JavaScript', 'DOM e eventos', 'Assincronismo e Fetch API') },
  { titulo: 'React Developer', plataforma: 'DIO', categoria: 'front-end', cor: '#7DD3FC',
    modulos: feito('Componentes e props', 'Hooks e estado', 'Consumo de APIs') },
  { titulo: 'GitHub Certification', plataforma: 'DIO', categoria: 'ferramentas', cor: '#4FC3A1',
    modulos: feito('Git e versionamento', 'GitHub Actions') },
  { titulo: 'UI/UX Designer', plataforma: 'DIO', categoria: 'design', cor: '#E9798A',
    modulos: feito('Fundamentos de UX', 'Prototipação no Figma', 'Design system') },
  { titulo: 'Angular na prática', plataforma: 'Projeto próprio', categoria: 'front-end', cor: '#5B8DEF',
    modulos: m('Componentes standalone e templates', 'Signals e estado', 'Rotas e lazy loading',
      'HttpClient, interceptors e APIs', 'Formulários reativos', 'Supabase e autenticação', 'PWA e deploy na Vercel') },
];
