-- 006: retira permissões que o Supabase dá por padrão e o site não usa.
-- TRUNCATE ignora RLS; TRIGGER e REFERENCES não são necessários para anon/authenticated.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke truncate, trigger, references on tables from anon, authenticated;
