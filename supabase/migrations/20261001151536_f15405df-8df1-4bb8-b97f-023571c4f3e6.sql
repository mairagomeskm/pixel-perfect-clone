create type public.app_role as enum ('admin','moderator','user');
create type public.profile_type as enum ('adotante','ong','protetor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles visible" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  profile_type profile_type not null default 'adotante',
  name text,
  email text,
  phone text,
  cep text,
  address text,
  cpf text,
  cnpj text,
  social_link text,
  proof_path text,
  census jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "view own or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "update own or admin" on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, profile_type, phone, cep, cpf, cnpj, social_link)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    coalesce((new.raw_user_meta_data->>'profile_type')::profile_type, 'adotante'),
    new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'cep',
    new.raw_user_meta_data->>'cpf', new.raw_user_meta_data->>'cnpj',
    new.raw_user_meta_data->>'social_link');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Organizations (ONGs / protetores cadastrados pelo admin)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind profile_type not null default 'ong',
  document text,
  phone text,
  social_link text,
  region text,
  created_at timestamptz not null default now()
);
grant select on public.organizations to anon, authenticated;
grant insert, update, delete on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;
create policy "public read orgs" on public.organizations for select using (true);
create policy "admin manage orgs" on public.organizations for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text not null default 'cao',
  age_label text not null default '',
  is_puppy boolean not null default false,
  region text not null default 'Plano Piloto',
  photo_url text,
  description text,
  status text not null default 'disponivel',
  owner_id uuid references auth.users(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.pets to anon, authenticated;
grant insert, update, delete on public.pets to authenticated;
grant all on public.pets to service_role;
alter table public.pets enable row level security;
create policy "public read pets" on public.pets for select using (true);
create policy "owner or admin insert pets" on public.pets for insert to authenticated
  with check (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "owner or admin update pets" on public.pets for update to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "owner or admin delete pets" on public.pets for delete to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  photo_url text,
  goal numeric not null default 0,
  raised numeric not null default 0,
  pix_key text not null default '',
  pix_name text not null default 'Caritas Pets',
  pet_id uuid references public.pets(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.campaigns to anon, authenticated;
grant insert, update, delete on public.campaigns to authenticated;
grant all on public.campaigns to service_role;
alter table public.campaigns enable row level security;
create policy "public read campaigns" on public.campaigns for select using (true);
create policy "admin manage campaigns" on public.campaigns for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.missing_pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  location text not null,
  description text,
  contact text,
  created_at timestamptz not null default now()
);
grant select on public.missing_pets to anon, authenticated;
grant insert, update, delete on public.missing_pets to authenticated;
grant all on public.missing_pets to service_role;
alter table public.missing_pets enable row level security;
create policy "public read missing" on public.missing_pets for select using (true);
create policy "admin manage missing" on public.missing_pets for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'pet',
  pet_id uuid references public.pets(id) on delete set null,
  adopter_id uuid not null references auth.users(id) on delete cascade,
  protector_id uuid references auth.users(id) on delete set null,
  pinned_message_id uuid,
  title text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
grant select, insert, update on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;

create or replace function public.is_conversation_member(_conv uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.conversations c where c.id = _conv
    and (c.adopter_id = _user or c.protector_id = _user or public.has_role(_user,'admin')))
$$;

create policy "members read conv" on public.conversations for select to authenticated
  using (public.is_conversation_member(id, auth.uid()));
create policy "adopter creates conv" on public.conversations for insert to authenticated
  with check (adopter_id = auth.uid());
create policy "members update conv" on public.conversations for update to authenticated
  using (protector_id = auth.uid() or public.has_role(auth.uid(),'admin') or adopter_id = auth.uid());

create or replace function public.set_conversation_protector()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'pet' and new.pet_id is not null then
    select owner_id into new.protector_id from public.pets where id = new.pet_id;
  elsif new.kind = 'support' then
    new.protector_id := null;
  end if;
  return new;
end; $$;
create trigger conv_set_protector before insert on public.conversations
  for each row execute function public.set_conversation_protector();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  is_bot boolean not null default false,
  body text,
  attachment_path text,
  attachment_type text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "members read msgs" on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));
create policy "members send msgs" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and is_bot = false and public.is_conversation_member(conversation_id, auth.uid()));
create policy "members mark read" on public.messages for update to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));

create or replace function public.conversation_bot_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare mid uuid;
begin
  if new.kind = 'pet' then
    insert into public.messages (conversation_id, is_bot, body)
    values (new.id, true, 'Olá! Responda 3 perguntinhas rápidas: Você mora em casa ou apartamento? Tem telas de proteção? Já tem outros animais? Requisitos: ser maior de 18 anos, morar no DF ou entorno e enviar comprovante de residência.')
    returning id into mid;
  else
    insert into public.messages (conversation_id, is_bot, body)
    values (new.id, true, 'Olá! Aqui é a equipe do Carita''s Pets. Conte como podemos ajudar que responderemos em breve.')
    returning id into mid;
  end if;
  update public.conversations set pinned_message_id = mid where id = new.id;
  return new;
end; $$;
create trigger conv_bot_message after insert on public.conversations
  for each row execute function public.conversation_bot_message();

create or replace function public.touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end; $$;
create trigger msg_touch after insert on public.messages
  for each row execute function public.touch_conversation();

-- Diary (stories)
create table public.diary_posts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image',
  caption text,
  created_at timestamptz not null default now()
);
grant select on public.diary_posts to anon, authenticated;
grant insert, delete on public.diary_posts to authenticated;
grant all on public.diary_posts to service_role;
alter table public.diary_posts enable row level security;
create policy "public read diary" on public.diary_posts for select using (true);
create policy "auth posts diary" on public.diary_posts for insert to authenticated with check (author_id = auth.uid());
create policy "author or admin delete diary" on public.diary_posts for delete to authenticated
  using (author_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "own notifications delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

create or replace function public.notify_diary_post()
returns trigger language plpgsql security definer set search_path = public as $$
declare o uuid; pname text;
begin
  select owner_id, name into o, pname from public.pets where id = new.pet_id;
  if o is not null and o <> new.author_id then
    insert into public.notifications (user_id, title, body, link)
    values (o, 'Novidade no Diário do Pet', pname || ' ganhou uma nova atualização do adotante!', '/diario');
  end if;
  return new;
end; $$;
create trigger diary_notify after insert on public.diary_posts
  for each row execute function public.notify_diary_post();

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;

-- Storage
create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "auth upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "chat upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-attachments' and public.is_conversation_member(((storage.foldername(name))[1])::uuid, auth.uid()));
create policy "chat read" on storage.objects for select to authenticated
  using (bucket_id = 'chat-attachments' and public.is_conversation_member(((storage.foldername(name))[1])::uuid, auth.uid()));
create policy "proof upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "proof update own" on storage.objects for update to authenticated
  using (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "proof read own or admin" on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));

-- Seed
insert into public.organizations (name, kind, region, social_link) values
  ('Lar dos Bigodes', 'ong', 'Cruzeiro', 'https://instagram.com/'),
  ('Patinhas do Gama', 'ong', 'Gama', 'https://instagram.com/');

insert into public.pets (name, species, age_label, is_puppy, region, photo_url, description, status) values
  ('Mel', 'gato', '2 meses', true, 'Cruzeiro', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80', 'Gatinha carinhosa, adora colo.', 'disponivel'),
  ('Thor', 'cao', '3 anos', false, 'Asa Norte', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80', 'Cão brincalhão e muito leal.', 'disponivel'),
  ('Luna', 'gato', '1 ano', false, 'Taguatinga', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80', 'Calma e curiosa.', 'disponivel'),
  ('Pipoca', 'cao', '4 meses', true, 'Gama', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', 'Filhote cheio de energia.', 'disponivel'),
  ('Frida', 'gato', '5 anos', false, 'Sudoeste', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&q=80', 'Ronrona o dia todo.', 'adotado'),
  ('Bolinha', 'cao', '2 anos', false, 'Ceilândia', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&q=80', 'Companheiro para todas as horas.', 'adotado');

insert into public.campaigns (title, description, photo_url, goal, raised, pix_key) values
  ('Cirurgia da Pretinha', 'Fratura na pata traseira após atropelamento no Cruzeiro.', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80', 2500, 1380, 'contato@caritaspets.com.br'),
  ('Ração para o abrigo', 'Um mês de ração para 40 gatinhos resgatados.', 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&q=80', 1200, 860, 'contato@caritaspets.com.br');

insert into public.missing_pets (name, photo_url, location, description, contact) values
  ('Caramelo', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80', 'Cruzeiro Velho, próximo à feira', 'Usa coleira azul. Muito dócil.', '(61) 99999-0001'),
  ('Nina', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80', 'Asa Sul, SQS 308', 'Gata tricolor, castrada.', '(61) 99999-0002');