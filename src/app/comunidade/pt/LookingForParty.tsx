"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Box from "@/components/Box";
import { GuildTag } from "@/components/GuildTag";
import { ReleaseChar, friendlyError, useMe } from "@/components/Social";
import { createClient } from "@/lib/supabase/client";
import { onSocialChange } from "@/lib/timeline";

interface Post {
  id: string;
  char_name: string;
  vocation: string | null;
  level: number | null;
  hunt: string;
  note: string | null;
  starts_at: string;
  expires_at: string;
}
interface Online {
  name: string;
  level: number | null;
  vocation: string | null;
  guild: string | null;
}

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
const short = (v: string | null) => (v ?? "").replace(/^(Master|Elder|Elite|Royal|Exalted) /, "");

export default function LookingForParty({ hunts }: { hunts: string[] }) {
  const me = useMe();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [online, setOnline] = useState<Online[] | null>(null);
  const [filter, setFilter] = useState("");
  const [now, setNow] = useState(0);

  const load = () => {
    const sb = createClient();
    sb.from("lfg_posts")
      .select("id, char_name, vocation, level, hunt, note, starts_at, expires_at")
      .order("starts_at")
      .then(({ data }) => {
        setPosts((data ?? []) as Post[]);
        setNow(Date.now());
      });
    sb.rpc("online_now").then(({ data }) => setOnline((data ?? []) as Online[]));
  };
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    load();
    return onSocialChange(load, 60_000);
  }, []);

  const onlineSet = useMemo(() => new Set((online ?? []).map((o) => o.name.toLowerCase())), [online]);
  const shown = (online ?? []).filter((o) => !filter || short(o.vocation).toLowerCase().includes(filter));

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px] items-start">
      <div>
        <Box title="📣 Anunciar">
          {!me.loaded ? (
            <p className="muted text-[12px]">Carregando...</p>
          ) : !me.userId ? (
            <p className="text-[12px]">
              <Link href="/entrar?next=/comunidade/pt">Entre</Link> para anunciar. A lista de quem procura PT é aberta para todos.
            </p>
          ) : !me.chars.length ? (
            <ReleaseChar me={me} />
          ) : (
            <PostForm hunts={hunts} me={me} onSaved={load} />
          )}
        </Box>
        <Box title={`🤝 Procurando PT${posts?.length ? ` (${posts.length})` : ""}`}>
          {posts === null ? (
            <p className="muted text-[12px]">Carregando...</p>
          ) : posts.length === 0 ? (
            <p className="text-[12px]">Ninguém procurando agora. Seja o primeiro: anuncie a hunt aqui em cima.</p>
          ) : (
            <ul className="space-y-2">
              {posts.map((p) => {
                const mine = me.chars.some((c) => c.name === p.char_name);
                const on = onlineSet.has(p.char_name.toLowerCase());
                return (
                  <li key={p.id} className="border border-[#b98a5a] rounded p-2 bg-white/40 text-[12px]">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <Link href={`/char/${encodeURIComponent(p.char_name)}`} className="font-bold">
                        {p.char_name}
                      </Link>
                      <span>
                        {short(p.vocation)} {p.level ?? ""}
                      </span>
                      {on && <span className="tag tag-earth">🟢 online</span>}
                      <span className="ml-auto muted text-[11px]">
                        {new Date(p.starts_at).getTime() > now + 5 * 60_000 ? `às ${hhmm(p.starts_at)}` : "agora"} · até {hhmm(p.expires_at)}
                      </span>
                    </div>
                    <div className="mt-0.5">
                      🗺️ <b>{p.hunt}</b>
                      {p.note ? ` · ${p.note}` : ""}
                    </div>
                    {mine && (
                      <button
                        type="button"
                        className="underline text-[11px] opacity-70"
                        onClick={async () => {
                          await createClient().from("lfg_posts").delete().eq("id", p.id);
                          load();
                        }}
                      >
                        tirar anúncio
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="muted text-[10px] mt-2">Combine no jogo: mande mensagem para o char do anúncio. Anúncios somem 3 horas depois do horário.</p>
        </Box>
      </div>
      <Box title={`🟢 Online agora${online ? ` (${online.length})` : ""}`}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full mb-2 text-[12px]" aria-label="Vocação">
          <option value="">todas as vocações</option>
          {["sorcerer", "druid", "knight", "paladin", "monk"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        {online === null ? (
          <p className="muted text-[12px]">Carregando...</p>
        ) : shown.length === 0 ? (
          <p className="text-[12px]">Ninguém online agora.</p>
        ) : (
          <ul className="text-[12px] space-y-0.5 max-h-[520px] overflow-y-auto">
            {shown.map((o) => (
              <li key={o.name} className="flex items-center gap-1">
                <Link href={`/char/${encodeURIComponent(o.name)}`} className="truncate">
                  {o.name}
                </Link>
                <span className="muted text-[11px] whitespace-nowrap">
                  {short(o.vocation).slice(0, 3)} {o.level ?? ""}
                </span>
                <span className="ml-auto">
                  <GuildTag guild={o.guild} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="muted text-[10px] mt-2">Membros das guildas e chars liberados vistos online nos últimos minutos. Atualiza a cada 5 minutos.</p>
      </Box>
    </div>
  );
}

function PostForm({ hunts, me, onSaved }: { hunts: string[]; me: ReturnType<typeof useMe>; onSaved: () => void }) {
  const [charId, setCharId] = useState(me.chars[0]?.id ?? "");
  const [hunt, setHunt] = useState("");
  const [note, setNote] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="space-y-2 text-[12px]"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        let starts: string | null = null;
        if (when) {
          const [h, m] = when.split(":").map(Number);
          const d = new Date();
          d.setHours(h, m, 0, 0);
          if (d.getTime() < Date.now() - 5 * 60_000) d.setDate(d.getDate() + 1);
          starts = d.toISOString();
        }
        const { error } = await createClient().rpc("add_lfg", { p_char: charId, p_hunt: hunt, p_note: note || null, p_starts: starts });
        setBusy(false);
        if (error) return setMsg(friendlyError(error.message));
        setHunt("");
        setNote("");
        setMsg("✅ Anúncio no ar por 3 horas.");
        onSaved();
      }}
    >
      <div className="flex flex-wrap gap-2 items-end">
        <label>
          <span className="block font-bold">Char</span>
          <select value={charId} onChange={(e) => setCharId(e.target.value)}>
            {me.chars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-[180px]">
          <span className="block font-bold">Hunt</span>
          <input
            value={hunt}
            onChange={(e) => setHunt(e.target.value)}
            list="pt-hunts"
            maxLength={80}
            className="w-full"
            placeholder="ex.: Gnomprona, Soul War, boss..."
          />
          <datalist id="pt-hunts">
            {hunts.map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </label>
        <label>
          <span className="block font-bold">Horário</span>
          <input type="time" value={when} onChange={(e) => setWhen(e.target.value)} title="Vazio = agora" />
        </label>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={200}
        className="w-full"
        placeholder="Observação (opcional): falta EK, levo prey, 2h de hunt..."
      />
      <div className="flex items-center gap-2">
        <button type="submit" className="tc-btn" disabled={busy || hunt.trim().length < 2}>
          {busy ? "Anunciando..." : "Anunciar"}
        </button>
        <span className="muted text-[11px]">Horário vazio = agora. Um anúncio por char.</span>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
