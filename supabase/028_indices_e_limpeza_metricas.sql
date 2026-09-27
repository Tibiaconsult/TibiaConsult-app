-- 028: índices das chaves estrangeiras apontados pelo Performance Advisor (também deixam rápidas as travas "N por dia/hora",
-- que contam por user_id) e limpeza das visitas ao /admin, que deixaram de entrar nas métricas.
create index if not exists hunt_routes_user_recent on public.hunt_routes (user_id, created_at desc);
create index if not exists hunt_routes_char on public.hunt_routes (char_id);
create index if not exists hunt_route_votes_user on public.hunt_route_votes (user_id);
create index if not exists hunt_sessions_user_recent on public.hunt_sessions (user_id, created_at desc);
create index if not exists hunt_sessions_char on public.hunt_sessions (char_id);
create index if not exists bestiary_tracking_user on public.bestiary_tracking (user_id);
delete from public.site_visits where path like '/admin%';
