-- Create links table
create table if not exists links (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  url text not null,
  thumbnail_url text,
  abbreviation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table links enable row level security;

-- Policy for Admins (Full Access)
create policy "Admins can do everything on links"
on links
for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'adm'
  )
);

-- Policy for Users (Read Only - if needed, but user asked for adm access rule)
-- The user request says: "Essa página tem regra de acesso do tipo adm."
-- It implies only admins can access it. However, if regular users need to SEE the links, we might need a select policy for them.
-- "a função dela é guardar links importantes, e exibilos com thum e abreviação para fácil acesso"
-- "Preciso que as informações(links) fiquem salvos em uma tabela do banco de dados. Deverá ter opção para inserir, alterar e remover os links."
-- Given "regra de acesso do tipo adm", I will restrict EVERYTHING to admins for now as per strict interpretation. 
-- If regular users need to see it, I can add a select policy later or if the user clarifies.
-- Actually, "listar os links importantes" might imply for everyone? 
-- "Essa página tem regra de acesso do tipo adm" -> The PAGE has adm access.
-- So likely only admins can even see the page.
-- So the RLS should definitely allow admins.
