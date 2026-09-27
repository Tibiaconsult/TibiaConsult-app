// Notificações pelo navegador: o sino (lista e não lidas) e o push no celular/PC.
// Os avisos são criados pelo banco (021): comentário, fofoca, morte e level up dos seus chars.

import { createClient } from "@/lib/supabase/client";

/** Chave pública VAPID (a privada fica só no banco). */
export const VAPID_PUBLIC = "BAoqdRrDXvpaQEUCZx-9iz59P_D-P_c-4SgOXC5IVv03aaQxyXZBitkogeHjmcloljmtkzOQ6dzZLIwokZfjmgo";

export interface Notification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  url: string | null;
  created_at: string;
  read_at: string | null;
}

export async function loadNotifications(limit = 50): Promise<Notification[]> {
  const { data } = await createClient()
    .from("notifications")
    .select("id, kind, title, body, url, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}

export async function unreadCount(): Promise<number> {
  const { count } = await createClient().from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
  return count ?? 0;
}

export async function markAllRead(): Promise<void> {
  await createClient().from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
}

export async function clearAll(): Promise<void> {
  await createClient().from("notifications").delete().not("id", "is", null);
}

// ---------------------------------------------------------------- push

export type PushState = "unsupported" | "ios-install" | "denied" | "off" | "on";

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;

function keyBytes(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(new ArrayBuffer(s.length));
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
}

/** Situação do push neste aparelho. */
export async function pushState(): Promise<PushState> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window))
    return isIos() && !standalone() ? "ios-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  const sub = await (await registration()).pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

async function save(sub: PushSubscription): Promise<string | null> {
  const j = sub.toJSON();
  const { error } = await createClient().rpc("push_subscribe", { p_endpoint: sub.endpoint, p_p256dh: j.keys?.p256dh ?? "", p_auth: j.keys?.auth ?? "" });
  return error?.message ?? null;
}

/** Liga o push (pede permissão ao navegador). Devolve a mensagem de erro, se houver. */
export async function enablePush(): Promise<string | null> {
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return "O navegador não deu permissão. Libere as notificações do site nas configurações.";
    const reg = await registration();
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC) }));
    return await save(sub);
  } catch (e) {
    return e instanceof Error ? e.message : "Não deu para ligar as notificações.";
  }
}

export async function disablePush(): Promise<void> {
  const sub = await (await registration()).pushManager.getSubscription();
  if (!sub) return;
  await createClient().rpc("push_unsubscribe", { p_endpoint: sub.endpoint });
  await sub.unsubscribe();
}

/** Push já ligado: confirma o aparelho na conta atual (troca de conta no mesmo navegador, chave renovada). */
export async function refreshPush(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || Notification.permission !== "granted") return;
  const sub = await (await registration()).pushManager.getSubscription();
  if (sub) await save(sub);
}
