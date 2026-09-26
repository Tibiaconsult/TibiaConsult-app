-- O projeto foi criado com "Automatically expose new tables" desligado, então a tabela
-- não recebeu permissão para o papel "authenticated". Sem isso, todo insert falhava.
-- A segurança por usuário continua nas políticas RLS (cada um só acessa os próprios chars).
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.chars to authenticated;
