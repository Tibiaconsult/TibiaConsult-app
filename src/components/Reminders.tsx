"use client";

// Lembrete com hora marcada: vira aviso no sino e no celular quando vence (023). Boss liberado, stamina verde etc.

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ReminderInput {
  kind: "boss" | "stamina" | "outro";
  /** identifica o lembrete ativo (um por kind+ref): nome do boss, "stamina"... */
  ref: string;
  title: string;
  body?: string;
  url?: string;
}

const when = (d: Date) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export async function setReminder(r: ReminderInput, dueAt: Date): Promise<string | null> {
  const { error } = await createClient().rpc("set_reminder", {
    p_kind: r.kind,
    p_ref: r.ref,
    p_title: r.title,
    p_body: r.body ?? null,
    p_url: r.url ?? null,
    p_due: dueAt.toISOString(),
  });
  return error ? error.message : null;
}

/** Botão "⏰ me avise". `minutes` = daqui a quanto tempo. */
export function RemindButton({ r, minutes, label, compact }: { r: ReminderInput; minutes: number; label: string; compact?: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <button
        type="button"
        className={`tc-btn ${compact ? "!py-0 !px-2 text-[11px]" : "!py-0.5"}`}
        disabled={busy || minutes <= 0}
        onClick={async () => {
          setBusy(true);
          const { data } = await createClient().auth.getSession();
          if (!data.session) {
            setBusy(false);
            return setMsg("entre na conta");
          }
          const due = new Date(Date.now() + minutes * 60_000);
          const err = await setReminder(r, due);
          setBusy(false);
          setMsg(err ? `não deu: ${err}` : `✅ aviso ${when(due)}`);
        }}
      >
        {busy ? "..." : label}
      </button>
      {msg && (
        <span className="text-[10px]">
          {msg === "entre na conta" ? (
            <>
              <Link href="/entrar">Entre</Link> para receber lembretes
            </>
          ) : (
            msg
          )}
        </span>
      )}
    </span>
  );
}

interface Row {
  id: string;
  title: string;
  due_at: string;
  url: string | null;
}

/** Lista dos lembretes ativos da conta, com opção de apagar. */
export function MyReminders() {
  const [list, setList] = useState<Row[] | null>(null);
  useEffect(() => {
    createClient()
      .from("reminders")
      .select("id, title, due_at, url")
      .is("sent_at", null)
      .order("due_at")
      .then(({ data }) => setList((data ?? []) as Row[]));
  }, []);
  if (!list) return <p className="muted text-[12px]">Carregando...</p>;
  if (!list.length)
    return (
      <p className="text-[12px]">
        Nenhum lembrete marcado. Crie no <Link href="/ferramentas/bosstiary">Bosstiary</Link> (boss liberado) ou na{" "}
        <Link href="/ferramentas/calculadoras">calculadora de stamina</Link>.
      </p>
    );
  return (
    <ul className="space-y-1 text-[12px]">
      {list.map((r) => (
        <li key={r.id} className="flex items-center gap-2 border border-[#b98a5a] rounded px-2 py-1 bg-white/40">
          <span className="flex-1">
            ⏰ <b>{r.title}</b> · {when(new Date(r.due_at))}
          </span>
          <button
            type="button"
            className="underline text-[11px]"
            onClick={async () => {
              await createClient().from("reminders").delete().eq("id", r.id);
              setList((l) => (l ?? []).filter((x) => x.id !== r.id));
            }}
          >
            apagar
          </button>
        </li>
      ))}
    </ul>
  );
}
