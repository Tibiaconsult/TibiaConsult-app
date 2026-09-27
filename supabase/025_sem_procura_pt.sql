-- 025: o Procura-se PT saiu do site (decisão do dono); some a tabela de anúncios, as funções e a limpeza diária.
select cron.unschedule(jobid) from cron.job where jobname = 'tc-lfg-clean';
drop function if exists public.add_lfg(uuid, text, text, timestamptz);
drop function if exists public.online_now();
drop table if exists public.lfg_posts;
