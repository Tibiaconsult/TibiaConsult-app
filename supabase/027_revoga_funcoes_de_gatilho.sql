-- 027: funções de gatilho não precisam ser chamadas pela API: tira o EXECUTE de anon/authenticated (os gatilhos continuam
-- rodando normalmente; o Postgres não confere EXECUTE ao disparar um gatilho). Apontado pelo Security Advisor do Supabase.
revoke execute on function public.comments_notify() from public, anon, authenticated;
revoke execute on function public.deaths_notify() from public, anon, authenticated;
revoke execute on function public.gossips_notify() from public, anon, authenticated;
revoke execute on function public.levels_notify() from public, anon, authenticated;
revoke execute on function public.snap_level_up() from public, anon, authenticated;
