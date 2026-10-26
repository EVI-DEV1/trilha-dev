import type { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/** true quando URL e chave do Supabase estão preenchidas no environment. */
export const MODO_NUVEM = !!(environment.supabase.url && environment.supabase.anonKey);

let cliente: Promise<SupabaseClient> | null = null;

/**
 * Cliente único do Supabase, criado só quando é usado.
 * A biblioteca é carregada sob demanda (import dinâmico): vira um arquivo separado
 * e não atrasa a primeira pintura da tela.
 */
export function supabase(): Promise<SupabaseClient> {
  cliente ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(environment.supabase.url, environment.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }),
  );
  return cliente;
}
