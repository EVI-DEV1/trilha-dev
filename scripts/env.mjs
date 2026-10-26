// Antes do build (npm run build), injeta as chaves do Supabase vindas de variáveis de ambiente.
// Na Vercel: Settings → Environment Variables → SUPABASE_URL e SUPABASE_ANON_KEY.
// Sem as variáveis, não mexe em nada (o build local usa o environment que você já tem).
import { readFileSync, writeFileSync } from 'node:fs';

const url = process.env.SUPABASE_URL;
const chave = process.env.SUPABASE_ANON_KEY;
if (!url || !chave) {
  console.log('[env] SUPABASE_URL/SUPABASE_ANON_KEY não definidas: mantendo src/environments como está.');
  process.exit(0);
}
const arquivo = 'src/environments/environment.prod.ts';
const atual = readFileSync(arquivo, 'utf8');
const novo = atual.replace(/supabase:\s*\{[^}]*\}/, `supabase: { url: ${JSON.stringify(url)}, anonKey: ${JSON.stringify(chave)} }`);
writeFileSync(arquivo, novo);
console.log('[env] Supabase configurado a partir das variáveis de ambiente.');
