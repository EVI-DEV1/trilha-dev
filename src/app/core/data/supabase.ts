import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/** true quando URL e chave do Supabase estão preenchidas no environment. */
export const MODO_NUVEM = !!(environment.supabase.url && environment.supabase.anonKey);

let cliente: SupabaseClient | null = null;

/** Cliente único do Supabase, criado só quando é usado. */
export function supabase(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(environment.supabase.url, environment.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cliente;
}
