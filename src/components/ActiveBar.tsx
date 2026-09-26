"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ActiveChar, VOCS, VOC_OUTFIT_FILE, VOC_SHORT, Voc, setActiveChar, setActiveVoc, useActive } from "@/lib/active";
import { wikiImage } from "@/lib/md5";
import type { SearchEntry } from "@/lib/search-index";

/** Busca rápida: páginas, hunts, magias, itens, imbuements e criaturas. */
function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const [lib, setLib] = useState<{ index: SearchEntry[]; search: (i: SearchEntry[], q: string) => SearchEntry[] } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const load = () => {
    if (lib) return;
    import("@/lib/search-index").then((m) => setLib({ index: m.buildIndex(), search: m.search }));
  };
  const results = lib && q.trim() ? lib.search(lib.index, q) : [];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (e: SearchEntry) => {
    setOpen(false);
    setQ("");
    router.push(e.href);
  };

  return (
    <div ref={box} className="relative flex-1 min-w-[180px]">
      <input
        type="search"
        value={q}
        placeholder="Buscar hunt, magia, item, criatura..."
        aria-label="Buscar no site"
        className="w-full !py-1"
        onFocus={() => {
          load();
          setOpen(true);
        }}
        onChange={(e) => {
          load();
          setQ(e.target.value);
          setSel(0);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSel((s) => Math.min(s + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSel((s) => Math.max(s - 1, 0));
          } else if (e.key === "Enter" && results[sel]) {
            e.preventDefault();
            go(results[sel]);
          } else if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded border-2 border-[#5f4d41] bg-[#f1e0c6] shadow-[0_4px_12px_rgba(0,0,0,.6)] max-h-[60vh] overflow-y-auto">
          {!lib ? (
            <div className="p-2 text-[12px] muted">Carregando...</div>
          ) : results.length === 0 ? (
            <div className="p-2 text-[12px] muted">Nada encontrado.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.kind + r.label + r.href}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(r)}
                onMouseEnter={() => setSel(i)}
                className={`block w-full text-left px-2 py-1 text-[12px] border-b border-[#d9c39a] ${i === sel ? "bg-[#f3d9a0]" : ""}`}
              >
                <b className="text-[#3a1a00]">{r.label}</b> <span className="muted text-[11px]">{r.kind}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

type Row = ActiveChar;

/** Barra do topo: busca, vocação ativa e, para quem está logado, o char ativo. */
export default function ActiveBar() {
  const { voc, char } = useActive();
  const [chars, setChars] = useState<Row[] | null>(null);
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const load = async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        setLogged(false);
        setChars(null);
        return;
      }
      setLogged(true);
      const { data } = await supabase.from("chars").select("id, name, vocation, level, magic_level, skill, world").order("created_at");
      const list = (data ?? []) as Row[];
      setChars(list);
      // mantém a cópia local do char ativo em dia (level, ML) ou solta se ele foi apagado
      const cur = list.find((c) => c.id === char?.id);
      if (char && !cur) setActiveChar(null);
      else if (cur && JSON.stringify(cur) !== JSON.stringify(char)) setActiveChar(cur);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current: Voc = voc ?? "sorcerer";

  return (
    <div className="tc-activebar">
      <SearchBox />
      <div className="flex items-center gap-1" role="group" aria-label="Vocação ativa">
        {VOCS.map((v) => (
          <button
            key={v}
            type="button"
            title={`Vocação ativa: ${VOC_SHORT[v]}`}
            aria-pressed={current === v}
            onClick={() => setActiveVoc(v)}
            className={`tc-voc-chip ${voc === v ? "is-active" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={wikiImage(VOC_OUTFIT_FILE[v])} alt={VOC_SHORT[v]} width={30} height={30} />
          </button>
        ))}
      </div>
      {logged && chars && chars.length > 0 ? (
        <label className="flex items-center gap-1 text-[12px] text-[#f3e9d2]">
          <span className="hidden sm:inline">Char:</span>
          <select
            value={char?.id ?? ""}
            onChange={(e) => setActiveChar(chars.find((c) => c.id === e.target.value) ?? null)}
            className="!py-0.5 max-w-[180px]"
            aria-label="Char ativo"
          >
            <option value="">nenhum</option>
            {chars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({VOC_SHORT[c.vocation]} {c.level})
              </option>
            ))}
          </select>
        </label>
      ) : logged && chars ? (
        <Link href="/meus-chars" className="text-[12px] text-[#f6d372]">
          Cadastrar char
        </Link>
      ) : logged === false ? (
        <Link href="/entrar" className="text-[12px] text-[#f6d372]" title="Com login, o site usa o level e o ML do seu char">
          Entrar para usar seu char
        </Link>
      ) : null}
    </div>
  );
}
