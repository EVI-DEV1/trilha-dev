// Produção: My JSON Server lê o db.json direto do repositório no GitHub.
// Leitura é real; gravações (POST/PATCH/DELETE) respondem OK mas não persistem.
export const environment = {
  production: true,
  apiUrl: 'https://my-json-server.typicode.com/EVI-DEV1/trilha-dev',
  githubApi: 'https://api.github.com',
  brasilApi: 'https://brasilapi.com.br/api',
  githubUser: 'EVI-DEV1',
  nomeUsuario: 'Eliane',
  // Cole aqui os dados do seu projeto Supabase (veja docs/09-supabase.md).
  // Vazio = modo local, usando a API do json-server.
  supabase: { url: '', anonKey: '' },
};
