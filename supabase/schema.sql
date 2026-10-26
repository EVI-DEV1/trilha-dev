-- Trilha Dev · esquema do banco no Supabase
-- Como usar: Supabase → SQL Editor → New query → cole este arquivo → Run.

create table if not exists public.trilhas (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo      text not null check (char_length(titulo) between 3 and 120),
  plataforma  text not null default '',
  categoria   text not null check (categoria in ('fundamentos', 'front-end', 'design', 'ferramentas')),
  cor         text not null default '#FF9A5C',
  modulos     jsonb not null default '[]'::jsonb,   -- [{ "id": 1, "titulo": "...", "concluido": false }]
  criado_em   timestamptz not null default now()
);

create index if not exists trilhas_user_id_idx on public.trilhas (user_id);

-- RLS (Row Level Security): cada pessoa só enxerga e altera as próprias trilhas.
-- É isso que torna seguro usar a chave pública (anon) no front-end.
alter table public.trilhas enable row level security;

drop policy if exists "trilhas: ler as próprias"     on public.trilhas;
drop policy if exists "trilhas: criar as próprias"   on public.trilhas;
drop policy if exists "trilhas: editar as próprias"  on public.trilhas;
drop policy if exists "trilhas: excluir as próprias" on public.trilhas;

create policy "trilhas: ler as próprias"     on public.trilhas for select to authenticated using ((select auth.uid()) = user_id);
create policy "trilhas: criar as próprias"   on public.trilhas for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "trilhas: editar as próprias"  on public.trilhas for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "trilhas: excluir as próprias" on public.trilhas for delete to authenticated using ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------
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
