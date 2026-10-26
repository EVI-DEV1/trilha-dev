// Desenvolvimento: '/api' é repassado para o json-server (porta 3000) pelo proxy.conf.json
export const environment = {
  production: false,
  apiUrl: '/api',
  githubApi: 'https://api.github.com',
  githubUser: 'EVI-DEV1',
  nomeUsuario: 'Eliane',
  // Cole aqui os dados do seu projeto Supabase (veja docs/09-supabase.md).
  // Vazio = modo local, usando a API do json-server.
  supabase: { url: '', anonKey: '' },
};
