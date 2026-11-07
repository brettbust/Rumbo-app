-- ============================================================
--  RUMBO - Configuracion de base de datos en Supabase
--  Pega TODO este contenido en Supabase > SQL Editor y pulsa "Run".
--  Es seguro ejecutarlo mas de una vez (usa IF NOT EXISTS).
-- ============================================================

-- 1) TABLA DE PERFILES
-- Un registro por usuario. Guarda sus ajustes y sus trofeos.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  settings    jsonb not null default '{}'::jsonb,   -- tema, idioma, recordatorio, etc.
  trophies    jsonb not null default '[]'::jsonb,   -- salon de trofeos
  trash       jsonb not null default '[]'::jsonb,   -- papelera de trofeos
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- 2) TABLA DE METAS (una fila por meta -> escalable)
create table if not exists public.goals (
  id          text primary key,                      -- el id que ya genera la app
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default '',
  emoji       text default '🎯',
  type        text default 'days',                   -- 'days' | 'number'
  freq        text,                                  -- 'daily' | 'weekly' | 'manual' | 'import'
  weekdays    jsonb default '[]'::jsonb,
  start_date  text,
  end_date    text,
  days        jsonb default '[]'::jsonb,             -- etapas: [{label,date,done,note,noteDate}]
  target      numeric,
  unit        text,
  current     numeric default 0,
  celebrated  boolean default false,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- Indice para buscar rapido las metas de un usuario
create index if not exists goals_user_id_idx on public.goals(user_id);

-- ============================================================
-- 3) SEGURIDAD (Row Level Security)
--    Cada usuario SOLO puede ver y tocar lo suyo. Imprescindible.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.goals    enable row level security;

-- Politicas de PERFILES
drop policy if exists "perfil_propio_select" on public.profiles;
create policy "perfil_propio_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "perfil_propio_insert" on public.profiles;
create policy "perfil_propio_insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "perfil_propio_update" on public.profiles;
create policy "perfil_propio_update" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "perfil_propio_delete" on public.profiles;
create policy "perfil_propio_delete" on public.profiles
  for delete using (auth.uid() = id);

-- Politicas de METAS
drop policy if exists "metas_propias_select" on public.goals;
create policy "metas_propias_select" on public.goals
  for select using (auth.uid() = user_id);

drop policy if exists "metas_propias_insert" on public.goals;
create policy "metas_propias_insert" on public.goals
  for insert with check (auth.uid() = user_id);

drop policy if exists "metas_propias_update" on public.goals;
create policy "metas_propias_update" on public.goals
  for update using (auth.uid() = user_id);

drop policy if exists "metas_propias_delete" on public.goals;
create policy "metas_propias_delete" on public.goals
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 4) Crear el perfil automaticamente al registrarse un usuario
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  LISTO. Si no hubo errores en rojo, la base esta preparada.
-- ============================================================
