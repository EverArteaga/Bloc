-- Tabla de notas de Rossi. Pegar en Supabase > SQL Editor > Run.
create table if not exists public.notas (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tipo text not null default 'text' check (tipo in ('text','list')),
  titulo text not null default '',
  cuerpo text not null default '',
  items jsonb not null default '[]',
  color text not null default 'rosa',
  fijada boolean not null default false,
  eliminada boolean not null default false,
  creada_en timestamptz not null default now(),
  actualizada_en timestamptz not null default now()
);
create index if not exists notas_user_act on public.notas (user_id, actualizada_en);
alter table public.notas enable row level security;
create policy "notas: ver propias" on public.notas for select using (auth.uid() = user_id);
create policy "notas: crear propias" on public.notas for insert with check (auth.uid() = user_id);
create policy "notas: editar propias" on public.notas for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notas: borrar propias" on public.notas for delete using (auth.uid() = user_id);
