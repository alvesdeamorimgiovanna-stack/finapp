-- ============================================================
-- FinApp · schema do Supabase (rode no SQL Editor do projeto)
-- Guarda o estado de cada usuário como JSON, isolado por conta.
-- ============================================================

create table if not exists public.finapp_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Permissões de tabela para o papel de usuário LOGADO (a RLS abaixo ainda
-- garante que cada um só acessa a própria linha). O papel "anon" (deslogado)
-- fica sem acesso de propósito — o app exige login.
grant select, insert, update, delete on public.finapp_state to authenticated;

-- Segurança por linha: cada pessoa só enxerga/edita os PRÓPRIOS dados.
alter table public.finapp_state enable row level security;

drop policy if exists "finapp_select_own" on public.finapp_state;
create policy "finapp_select_own"
  on public.finapp_state for select
  using (auth.uid() = user_id);

drop policy if exists "finapp_insert_own" on public.finapp_state;
create policy "finapp_insert_own"
  on public.finapp_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "finapp_update_own" on public.finapp_state;
create policy "finapp_update_own"
  on public.finapp_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Atualiza updated_at automaticamente
create or replace function public.finapp_touch()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists finapp_touch_trg on public.finapp_state;
create trigger finapp_touch_trg
  before update on public.finapp_state
  for each row execute function public.finapp_touch();
