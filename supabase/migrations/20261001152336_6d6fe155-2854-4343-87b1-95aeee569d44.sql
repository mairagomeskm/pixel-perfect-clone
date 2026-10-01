create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, profile_type, phone, cep, address, cpf, cnpj, social_link)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    coalesce((new.raw_user_meta_data->>'profile_type')::profile_type, 'adotante'),
    new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'cep', new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'cpf', new.raw_user_meta_data->>'cnpj',
    new.raw_user_meta_data->>'social_link');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;