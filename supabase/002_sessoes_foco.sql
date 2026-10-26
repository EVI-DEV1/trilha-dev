-- Sessões de foco (Pomodoro): sincroniza estatísticas entre aparelhos
-- ------------------------------------------------------------------
create table if not exists public.sessoes_foco (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  trilha_id  bigint references public.trilhas (id) on delete set null,
  modulo_id  integer,
  minutos    integer not null check (minutos between 1 and 600),
  criado_em  timestamptz not null default now()
);

create index if not exists sessoes_foco_user_data_idx on public.sessoes_foco (user_id, criado_em desc);

alter table public.sessoes_foco enable row level security;

drop policy if exists "sessoes: ler as próprias"     on public.sessoes_foco;
drop policy if exists "sessoes: criar as próprias"   on public.sessoes_foco;
drop policy if exists "sessoes: excluir as próprias" on public.sessoes_foco;

create policy "sessoes: ler as próprias"     on public.sessoes_foco for select to authenticated using ((select auth.uid()) = user_id);
create policy "sessoes: criar as próprias"   on public.sessoes_foco for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sessoes: excluir as próprias" on public.sessoes_foco for delete to authenticated using ((select auth.uid()) = user_id);
