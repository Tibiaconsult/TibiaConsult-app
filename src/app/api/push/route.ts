import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Envio das notificações push. Quem chama é o pg_cron (push_kick, a cada minuto, só quando há aviso novo),
// com a senha no cabeçalho x-push-key. A senha e as chaves VAPID ficam no banco: aqui não há segredo nenhum.

interface Item {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string | null;
  url: string | null;
  tag: string;
}

export async function GET(req: Request) {
  const key = req.headers.get("x-push-key");
  if (!key || !process.env.NEXT_PUBLIC_SUPABASE_URL) return Response.json({ ok: false }, { status: 401 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data, error } = await sb.rpc("push_take", { p_key: key });
  if (error || !data) return Response.json({ ok: false }, { status: 401 });

  const { public: pub, private: priv, subject, items } = data as { public: string; private: string; subject: string; items: Item[] };
  if (!pub || !priv) return Response.json({ ok: false, reason: "sem chaves" }, { status: 500 });

  const gone: string[] = [];
  let sent = 0;
  await Promise.all(
    items.map(async (it) => {
      try {
        await webpush.sendNotification(
          { endpoint: it.endpoint, keys: { p256dh: it.p256dh, auth: it.auth } },
          JSON.stringify({ title: it.title, body: it.body ?? "", url: it.url ?? "/notificacoes", tag: it.tag }),
          { vapidDetails: { subject, publicKey: pub, privateKey: priv }, TTL: 6 * 3600, urgency: "normal" },
        );
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(it.endpoint);
      }
    }),
  );
  if (gone.length) await sb.rpc("push_gone", { p_key: key, p_endpoints: gone });
  return Response.json({ ok: true, sent, gone: gone.length });
}
