-- NÃO APLICADO. Rodar só quando o SMTP próprio estiver pronto e a opção "Confirm email" for religada.
-- A confirmação ficou desligada a partir de 2026-09-26 19:07 UTC. Quem se cadastrou nesse período foi marcado
-- como confirmado automaticamente pelo Supabase. Este comando desmarca essas contas (menos a do administrador):
-- no próximo login com senha, o site mostra "Reenviar e-mail de confirmação".
update auth.users u
   set email_confirmed_at = null
 where u.created_at >= '2026-09-26 19:07:00+00'
   and u.email_confirmed_at is not null
   and not exists (select 1 from public.admins a where a.user_id = u.id);

-- Ao religar a verificação do char por código (desligada em 009 e fechada em 011):
-- grant execute on function public.start_verify(uuid) to authenticated;
-- grant execute on function public.check_verify(uuid) to authenticated;
-- e recolocar startVerify/checkVerify em src/app/meus-chars/actions.ts (histórico do git, commit 8440cb3).
