import { Categoria } from '../models/trilha.model';

/** Uma matéria ou tema sugerido, que vira uma trilha com módulos. */
export interface Sugestao {
  id: string;
  titulo: string;
  categoria: Categoria;
  modulos: string[];
}

export interface GrupoSugestoes {
  rotulo: string;
  itens: Sugestao[];
}

export interface Curso {
  id: string;
  nome: string;
  /** Nome curto, usado como "plataforma" das trilhas criadas. */
  curto: string;
  grupos: GrupoSugestoes[];
}

const s = (id: string, titulo: string, categoria: Categoria, modulos: string[]): Sugestao => ({ id, titulo, categoria, modulos });

// ---------------- Biblioteca de matérias e temas ----------------
const LOGICA = s('logica', 'Lógica de Programação', 'fundamentos', ['Algoritmos e pseudocódigo', 'Variáveis e tipos de dados', 'Condicionais e repetição', 'Vetores e matrizes', 'Funções e modularização']);
const CALCULO = s('calculo', 'Cálculo I', 'fundamentos', ['Limites e continuidade', 'Derivadas', 'Aplicações de derivadas', 'Integrais', 'Técnicas de integração']);
const DISCRETA = s('discreta', 'Matemática Discreta', 'fundamentos', ['Lógica proposicional', 'Conjuntos e relações', 'Indução matemática', 'Combinatória', 'Introdução a grafos']);
const ALGEBRA = s('algebra', 'Álgebra Linear', 'fundamentos', ['Matrizes e determinantes', 'Sistemas lineares', 'Espaços vetoriais', 'Transformações lineares', 'Autovalores e autovetores']);
const ESTATISTICA = s('estatistica', 'Probabilidade e Estatística', 'fundamentos', ['Estatística descritiva', 'Probabilidade', 'Variáveis aleatórias', 'Distribuições', 'Testes de hipótese']);
const FISICA = s('fisica', 'Física I', 'fundamentos', ['Cinemática', 'Leis de Newton', 'Trabalho e energia', 'Momento linear']);
const INTRO = s('intro-computacao', 'Introdução à Computação', 'fundamentos', ['Como o computador funciona', 'Sistemas de numeração', 'Internet e web', 'Carreiras em tecnologia']);
const POO = s('poo', 'Programação Orientada a Objetos', 'fundamentos', ['Classes e objetos', 'Encapsulamento', 'Herança e polimorfismo', 'Interfaces e abstração', 'Tratamento de exceções']);
const ED = s('estruturas-dados', 'Estruturas de Dados', 'fundamentos', ['Listas, pilhas e filas', 'Árvores', 'Tabelas hash', 'Grafos', 'Ordenação e busca', 'Complexidade (Big O)']);
const PAA = s('analise-algoritmos', 'Projeto e Análise de Algoritmos', 'fundamentos', ['Análise de complexidade', 'Divisão e conquista', 'Programação dinâmica', 'Algoritmos gulosos', 'Algoritmos em grafos', 'Problemas NP']);
const BD = s('banco-dados', 'Banco de Dados', 'fundamentos', ['Modelagem entidade-relacionamento', 'Modelo relacional e normalização', 'SQL: consultas', 'SQL: joins e agregações', 'Transações e índices']);
const SO = s('sistemas-operacionais', 'Sistemas Operacionais', 'fundamentos', ['Processos e threads', 'Escalonamento', 'Concorrência e sincronização', 'Gerência de memória', 'Sistemas de arquivos']);
const REDES = s('redes', 'Redes de Computadores', 'ferramentas', ['Modelo OSI e TCP/IP', 'HTTP e DNS', 'TCP e UDP', 'Endereçamento IP e roteamento', 'Segurança em redes']);
const ARQ = s('arquitetura-computadores', 'Arquitetura de Computadores', 'fundamentos', ['Representação de dados', 'Lógica digital', 'Organização do processador', 'Memória e cache', 'Entrada e saída']);
const CIRCUITOS = s('circuitos-digitais', 'Circuitos Digitais', 'fundamentos', ['Portas lógicas e álgebra booleana', 'Circuitos combinacionais', 'Circuitos sequenciais', 'Flip-flops e registradores', 'Introdução a FPGA']);
const EMBARCADOS = s('embarcados', 'Sistemas Embarcados e IoT', 'ferramentas', ['Microcontroladores', 'C para embarcados', 'Sensores e atuadores', 'Comunicação serial', 'Internet das Coisas']);
const TEORIA = s('teoria-computacao', 'Teoria da Computação', 'fundamentos', ['Autômatos finitos', 'Linguagens regulares', 'Gramáticas livres de contexto', 'Máquinas de Turing', 'Computabilidade e complexidade']);
const COMPILADORES = s('compiladores', 'Compiladores', 'fundamentos', ['Análise léxica', 'Análise sintática', 'Análise semântica', 'Geração de código']);
const IA = s('inteligencia-artificial', 'Inteligência Artificial', 'fundamentos', ['Busca e resolução de problemas', 'Aprendizado de máquina', 'Redes neurais', 'Processamento de linguagem natural', 'Ética em IA']);
const DISTRIBUIDOS = s('sistemas-distribuidos', 'Sistemas Distribuídos', 'ferramentas', ['Comunicação entre processos', 'Consistência e replicação', 'Tolerância a falhas', 'Microsserviços', 'Computação em nuvem']);
const REQUISITOS = s('engenharia-requisitos', 'Engenharia de Requisitos', 'fundamentos', ['Levantamento de requisitos', 'Requisitos funcionais e não funcionais', 'Histórias de usuário', 'Casos de uso', 'Validação e priorização']);
const UML = s('modelagem-uml', 'Modelagem de Software (UML)', 'fundamentos', ['Diagrama de casos de uso', 'Diagrama de classes', 'Diagrama de sequência', 'Diagrama de atividades']);
const AGIL = s('metodos-ageis', 'Processos e Métodos Ágeis', 'ferramentas', ['Ciclo de vida do software', 'Scrum', 'Kanban', 'Estimativas e métricas', 'Retrospectivas e melhoria contínua']);
const PADROES = s('padroes-projeto', 'Arquitetura e Padrões de Projeto', 'fundamentos', ['Princípios SOLID', 'Padrões criacionais', 'Padrões estruturais', 'Padrões comportamentais', 'Arquitetura em camadas e MVC', 'Clean Architecture']);
const TESTES = s('testes', 'Qualidade e Testes de Software', 'ferramentas', ['Tipos e níveis de teste', 'Testes unitários', 'Testes de integração', 'TDD', 'Testes end-to-end', 'Cobertura e qualidade']);
const GESTAO = s('gestao-projetos', 'Gerência de Projetos', 'ferramentas', ['Escopo e cronograma', 'Custos e riscos', 'Comunicação com as partes interessadas', 'Gestão ágil de projetos']);
const SEGURANCA = s('seguranca', 'Segurança da Informação', 'ferramentas', ['Confidencialidade, integridade e disponibilidade', 'Criptografia', 'Autenticação e autorização', 'OWASP Top 10', 'LGPD e privacidade']);
const IHC = s('ihc', 'Interação Humano-Computador', 'design', ['Usabilidade e heurísticas', 'Pesquisa com usuários', 'Acessibilidade', 'Prototipação', 'Avaliação de interfaces']);
const WEB = s('desenvolvimento-web', 'Desenvolvimento Web', 'front-end', ['HTML semântico', 'CSS e layout responsivo', 'JavaScript e DOM', 'Consumo de APIs', 'Publicação do site']);
const MOBILE_DISC = s('desenvolvimento-mobile', 'Desenvolvimento Mobile', 'front-end', ['Fundamentos de apps móveis', 'Interface e navegação', 'Armazenamento local', 'Consumo de APIs', 'Publicação nas lojas']);
const SI_ORG = s('sistemas-organizacoes', 'Sistemas de Informação nas Organizações', 'fundamentos', ['Tipos de sistemas (ERP, CRM, BI)', 'Processos de negócio (BPM)', 'Governança de TI', 'Decisões orientadas por dados']);
const BI = s('business-intelligence', 'Business Intelligence', 'ferramentas', ['Data warehouse', 'ETL', 'Modelagem dimensional', 'Dashboards e indicadores']);
const EMPREENDEDORISMO = s('empreendedorismo', 'Empreendedorismo e Inovação', 'fundamentos', ['Modelo de negócio (Canvas)', 'Validação de ideias', 'MVP', 'Pitch']);
const TCC = s('tcc', 'Trabalho de Conclusão de Curso', 'fundamentos', ['Escolha do tema', 'Revisão bibliográfica', 'Metodologia', 'Desenvolvimento', 'Escrita e apresentação']);
const INTEGRADOR = s('projeto-integrador', 'Projeto Integrador', 'fundamentos', ['Definição do problema', 'Planejamento', 'Desenvolvimento', 'Apresentação']);
const GIT = s('git-github', 'Git e GitHub', 'ferramentas', ['Commits e histórico', 'Branches e merge', 'Pull requests e code review', 'GitHub Actions']);
const INGLES = s('ingles-tecnico', 'Inglês Técnico', 'fundamentos', ['Vocabulário de TI', 'Leitura de documentação', 'Comunicação em equipe']);
const PRIMEIRO_PROJETO = s('primeiro-projeto', 'Primeiro Projeto no Portfólio', 'front-end', ['Ideia e escopo', 'Planejamento', 'Construção', 'Publicação no GitHub']);
const HARDWARE = s('hardware', 'Hardware e Manutenção', 'ferramentas', ['Componentes do computador', 'Montagem e manutenção', 'Instalação de sistemas', 'Diagnóstico de problemas']);

const HTML_CSS = s('html-css', 'HTML e CSS', 'front-end', ['HTML semântico', 'Flexbox e Grid', 'Responsividade', 'Acessibilidade na web']);
const JAVASCRIPT = s('javascript', 'JavaScript', 'front-end', ['Fundamentos da linguagem', 'DOM e eventos', 'Assincronismo e Fetch API', 'Módulos e ES6+']);
const TYPESCRIPT = s('typescript', 'TypeScript', 'front-end', ['Tipos básicos', 'Interfaces e tipos', 'Generics', 'TypeScript com frameworks']);
const REACT = s('react', 'React', 'front-end', ['Componentes e props', 'Estado e hooks', 'Rotas', 'Consumo de APIs', 'Testes de componentes']);
const ANGULAR = s('angular', 'Angular', 'front-end', ['Componentes standalone e templates', 'Signals', 'Rotas e lazy loading', 'HttpClient e interceptors', 'Formulários reativos']);
const PERFORMANCE = s('performance-web', 'Performance e SEO na Web', 'front-end', ['Lighthouse e Core Web Vitals', 'Otimização de imagens e fontes', 'Carregamento sob demanda', 'SEO técnico']);
const UX_DEVS = s('ux-para-devs', 'UX para Devs', 'design', ['Hierarquia visual', 'Design system', 'Figma para devs']);
const NODE = s('nodejs', 'Node.js', 'fundamentos', ['Módulos e npm', 'Express e rotas', 'Middlewares', 'Autenticação com JWT', 'Validação de dados']);
const APIS = s('apis-rest', 'APIs REST', 'fundamentos', ['Verbos e status HTTP', 'Modelagem de recursos', 'Documentação com OpenAPI', 'Versionamento e paginação']);
const SPRING = s('java-spring', 'Java e Spring Boot', 'fundamentos', ['POO em Java', 'Spring Boot e injeção de dependência', 'Spring Data JPA', 'APIs REST com Spring', 'Testes com JUnit']);
const PYTHON_BACK = s('python-backend', 'Python para Back-end', 'fundamentos', ['Sintaxe e estruturas', 'Ambientes virtuais e pip', 'FastAPI', 'ORM com SQLAlchemy']);
const DOCKER = s('docker', 'Docker', 'ferramentas', ['Imagens e contêineres', 'Dockerfile', 'Docker Compose', 'Boas práticas']);
const DEPLOY = s('deploy-nuvem', 'Deploy e Nuvem', 'ferramentas', ['Vercel e Netlify', 'Variáveis de ambiente', 'CI/CD com GitHub Actions', 'Monitoramento']);
const PYTHON_DADOS = s('python-dados', 'Python para Dados', 'fundamentos', ['Sintaxe e estruturas', 'NumPy', 'Pandas', 'Visualização com Matplotlib']);
const SQL_ANALISE = s('sql-analise', 'SQL para Análise de Dados', 'fundamentos', ['Consultas e filtros', 'Joins', 'Agregações e funções de janela', 'Modelagem para BI']);
const POWER_BI = s('power-bi', 'Power BI', 'ferramentas', ['Importação e tratamento', 'Modelagem de dados', 'DAX', 'Dashboards']);
const ML = s('machine-learning', 'Machine Learning', 'fundamentos', ['Regressão', 'Classificação', 'Validação de modelos', 'Clustering', 'Scikit-learn']);
const DEEP = s('deep-learning', 'Deep Learning e IA Generativa', 'fundamentos', ['Redes neurais', 'Visão computacional', 'Transformers e LLMs', 'Engenharia de prompt']);
const UX = s('fundamentos-ux', 'Fundamentos de UX', 'design', ['Design centrado no usuário', 'Pesquisa e entrevistas', 'Personas e jornadas', 'Arquitetura da informação']);
const UI = s('ui-design', 'UI Design', 'design', ['Tipografia', 'Cor e contraste', 'Grids e layout', 'Componentes de interface']);
const FIGMA = s('figma', 'Figma', 'design', ['Frames e Auto Layout', 'Componentes e variantes', 'Variables e tokens', 'Protótipos interativos']);
const DESIGN_SYSTEM = s('design-system', 'Design System', 'design', ['Design tokens', 'Biblioteca de componentes', 'Documentação', 'Handoff para devs']);
const ACESSIBILIDADE = s('acessibilidade', 'Acessibilidade Digital', 'design', ['WCAG', 'Contraste e legibilidade', 'Navegação por teclado', 'Leitores de tela']);
const USABILIDADE = s('testes-usabilidade', 'Testes de Usabilidade', 'design', ['Planejamento do teste', 'Moderação', 'Análise de resultados']);
const FLUTTER = s('flutter', 'Flutter e Dart', 'front-end', ['Dart básico', 'Widgets', 'Gerência de estado', 'Navegação', 'Consumo de APIs']);
const REACT_NATIVE = s('react-native', 'React Native', 'front-end', ['Componentes nativos', 'Navegação', 'Estado', 'APIs do dispositivo', 'Publicação']);
const KOTLIN = s('kotlin-android', 'Kotlin e Android', 'front-end', ['Kotlin básico', 'Jetpack Compose', 'ViewModel e estado', 'Persistência com Room']);
const SWIFT = s('swift-ios', 'Swift e iOS', 'front-end', ['Swift básico', 'SwiftUI', 'Navegação', 'Persistência']);
const UI_MOBILE = s('ui-mobile', 'Interfaces para Mobile', 'design', ['Padrões de iOS e Android', 'Gestos e navegação', 'Acessibilidade no celular']);
const LINUX = s('linux', 'Linux', 'ferramentas', ['Terminal e comandos', 'Permissões', 'Processos e serviços', 'Shell script']);
const K8S = s('kubernetes', 'Kubernetes', 'ferramentas', ['Pods e deployments', 'Services e ingress', 'ConfigMaps e secrets', 'Helm']);
const CICD = s('ci-cd', 'CI/CD', 'ferramentas', ['Pipelines', 'GitHub Actions', 'Testes automatizados no pipeline', 'Deploy contínuo']);
const AWS = s('aws', 'AWS e Computação em Nuvem', 'ferramentas', ['Conceitos de nuvem', 'EC2 e S3', 'IAM', 'Serverless']);
const IAC = s('infra-codigo', 'Infraestrutura como Código', 'ferramentas', ['Terraform', 'Módulos e estado', 'Ambientes']);
const OBSERVABILIDADE = s('observabilidade', 'Observabilidade', 'ferramentas', ['Logs', 'Métricas', 'Alertas', 'Tracing']);
const FUND_TESTES = s('fundamentos-testes', 'Fundamentos de Testes', 'ferramentas', ['Tipos e níveis de teste', 'Casos de teste', 'Técnicas de teste', 'Gestão de bugs']);
const CYPRESS = s('cypress', 'Testes Automatizados com Cypress', 'ferramentas', ['Primeiros testes', 'Seletores e comandos', 'Fixtures e mocks', 'Testes de API']);
const PLAYWRIGHT = s('playwright', 'Playwright', 'ferramentas', ['Primeiros testes', 'Locators', 'Vários navegadores', 'Relatórios e CI']);
const TESTE_API = s('testes-api', 'Testes de API', 'ferramentas', ['Postman', 'Validação de contratos', 'Automação de testes de API']);
const PERF_TESTES = s('testes-performance', 'Testes de Performance', 'ferramentas', ['Conceitos de carga e estresse', 'k6', 'Análise de resultados']);

// ---------------- Cursos ----------------
const inicio = (...itens: Sugestao[]): GrupoSugestoes => ({ rotulo: 'Início do curso', itens });
const meio = (...itens: Sugestao[]): GrupoSugestoes => ({ rotulo: 'Meio do curso', itens });
const fim = (...itens: Sugestao[]): GrupoSugestoes => ({ rotulo: 'Fim do curso', itens });
const essencial = (...itens: Sugestao[]): GrupoSugestoes => ({ rotulo: 'Essencial', itens });
const aprofundar = (...itens: Sugestao[]): GrupoSugestoes => ({ rotulo: 'Para aprofundar', itens });

export const CURSOS: { rotulo: string; cursos: Curso[] }[] = [
  {
    rotulo: 'Graduação',
    cursos: [
      { id: 'engenharia-software', nome: 'Engenharia de Software', curto: 'Eng. de Software', grupos: [
        inicio(LOGICA, DISCRETA, CALCULO, WEB, GIT),
        meio(POO, ED, BD, REQUISITOS, UML, AGIL, SO, REDES),
        fim(PADROES, TESTES, GESTAO, SEGURANCA, IHC, DISTRIBUIDOS, TCC),
      ] },
      { id: 'ciencia-computacao', nome: 'Ciência da Computação', curto: 'Ciência da Computação', grupos: [
        inicio(LOGICA, CALCULO, DISCRETA, ALGEBRA, ARQ),
        meio(POO, ED, PAA, BD, SO, REDES, TEORIA, ESTATISTICA),
        fim(COMPILADORES, IA, DISTRIBUIDOS, SEGURANCA, TCC),
      ] },
      { id: 'ads', nome: 'Análise e Desenvolvimento de Sistemas', curto: 'ADS', grupos: [
        inicio(LOGICA, WEB, BD, REQUISITOS, GIT),
        meio(POO, ED, UML, AGIL, MOBILE_DISC, REDES),
        fim(PADROES, TESTES, SEGURANCA, GESTAO, INTEGRADOR),
      ] },
      { id: 'sistemas-informacao', nome: 'Sistemas de Informação', curto: 'Sistemas de Informação', grupos: [
        inicio(LOGICA, WEB, SI_ORG, DISCRETA, ESTATISTICA),
        meio(POO, ED, BD, REQUISITOS, REDES, SO, AGIL),
        fim(GESTAO, BI, SEGURANCA, EMPREENDEDORISMO, TCC),
      ] },
      { id: 'engenharia-computacao', nome: 'Engenharia de Computação', curto: 'Eng. de Computação', grupos: [
        inicio(LOGICA, CALCULO, FISICA, ALGEBRA, CIRCUITOS),
        meio(ARQ, ED, POO, SO, REDES, ESTATISTICA),
        fim(EMBARCADOS, DISTRIBUIDOS, IA, TCC),
      ] },
    ],
  },
  {
    rotulo: 'Curso técnico',
    cursos: [
      { id: 'tecnico-informatica', nome: 'Técnico em Informática / Desenvolvimento de Sistemas', curto: 'Técnico em Informática', grupos: [
        inicio(LOGICA, INTRO, HARDWARE, WEB),
        meio(BD, POO, REDES, MOBILE_DISC),
        fim(INTEGRADOR, GIT),
      ] },
    ],
  },
  {
    rotulo: 'Formação ou bootcamp',
    cursos: [
      { id: 'front-end', nome: 'Desenvolvimento Front-end', curto: 'Front-end', grupos: [
        essencial(HTML_CSS, JAVASCRIPT, GIT, TYPESCRIPT, REACT),
        aprofundar(ANGULAR, PERFORMANCE, ACESSIBILIDADE, UX_DEVS, TESTES),
      ] },
      { id: 'back-end', nome: 'Desenvolvimento Back-end', curto: 'Back-end', grupos: [
        essencial(LOGICA, NODE, BD, APIS, GIT),
        aprofundar(SPRING, PYTHON_BACK, DOCKER, TESTES, SEGURANCA, PADROES),
      ] },
      { id: 'full-stack', nome: 'Desenvolvimento Full Stack', curto: 'Full Stack', grupos: [
        essencial(HTML_CSS, JAVASCRIPT, REACT, NODE, BD, GIT),
        aprofundar(TYPESCRIPT, APIS, DOCKER, DEPLOY, TESTES),
      ] },
      { id: 'dados-ia', nome: 'Ciência de Dados e IA', curto: 'Dados e IA', grupos: [
        essencial(PYTHON_DADOS, ESTATISTICA, SQL_ANALISE, POWER_BI),
        aprofundar(ALGEBRA, ML, DEEP, BI),
      ] },
      { id: 'ux-ui', nome: 'UX/UI Design', curto: 'UX/UI Design', grupos: [
        essencial(UX, UI, FIGMA, ACESSIBILIDADE),
        aprofundar(DESIGN_SYSTEM, USABILIDADE, IHC, HTML_CSS),
      ] },
      { id: 'mobile', nome: 'Desenvolvimento Mobile', curto: 'Mobile', grupos: [
        essencial(LOGICA, FLUTTER, REACT_NATIVE, APIS, GIT),
        aprofundar(KOTLIN, SWIFT, UI_MOBILE, TESTES),
      ] },
      { id: 'devops-cloud', nome: 'DevOps e Cloud', curto: 'DevOps e Cloud', grupos: [
        essencial(LINUX, REDES, GIT, DOCKER, CICD),
        aprofundar(K8S, AWS, IAC, OBSERVABILIDADE, SEGURANCA),
      ] },
      { id: 'qa', nome: 'Testes e Qualidade (QA)', curto: 'QA', grupos: [
        essencial(FUND_TESTES, LOGICA, CYPRESS, TESTE_API, GIT),
        aprofundar(PLAYWRIGHT, PERF_TESTES, AGIL, CICD),
      ] },
    ],
  },
  {
    rotulo: 'Outro',
    cursos: [
      { id: 'comecando', nome: 'Ainda não sei / estou começando', curto: 'Começando', grupos: [
        essencial(LOGICA, INTRO, HTML_CSS, GIT),
        aprofundar(JAVASCRIPT, INGLES, PRIMEIRO_PROJETO),
      ] },
    ],
  },
];

export function cursoPorId(id: string | null | undefined): Curso | undefined {
  if (!id) return undefined;
  for (const g of CURSOS) {
    const c = g.cursos.find((x) => x.id === id);
    if (c) return c;
  }
  return undefined;
}

export function totalSugestoes(c: Curso): number {
  return c.grupos.reduce((soma, g) => soma + g.itens.length, 0);
}
