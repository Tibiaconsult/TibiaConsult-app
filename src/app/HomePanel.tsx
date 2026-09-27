"use client";

import NumberInput from "@/components/NumberInput";
import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@/components/Box";
import { WHEEL_MILESTONES } from "@/data/wheel-milestones";
import { ActiveChar, VOCS, VOC_LABEL, VOC_OUTFIT_FILE, Voc, setActiveChar, setActiveVoc, useActive } from "@/lib/active";
import { comboHref, setHref, simHref, wheelHref } from "@/lib/char-links";
import { huntsFor } from "@/lib/hunt-level";
import { itemIcon, spellIcon } from "@/lib/icons";
import { wikiImage } from "@/lib/md5";
import { createClient } from "@/lib/supabase/client";

// Painel da página inicial. Quem chega escolhe a vocação; com vocação escolhida, o painel vira um atalho por tarefa;
// com login e char ativo, mostra o resumo do char: hunts do level, roda, set e combo salvos e o próximo marco da Wheel.

const TAGLINE: Record<Voc, string> = {
  sorcerer: "Fogo, energia e death, com a rotação convertida pela stance.",
  druid: "Gelo e terra, e a melhor cura da party.",
  knight: "Linha de frente: magias no elemento da arma.",
  paladin: "Distância e holy, com a munição definindo o elemento.",
  monk: "Mãos nuas, Harmony e cura da party.",
};

type Saved = { id: string; wheel_code: string | null; set_code: string | null; combo_code: string | null; weapon_attack: number | null };

function Outfit({ v, size = 48 }: { v: Voc; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={wikiImage(VOC_OUTFIT_FILE[v])} alt="" width={size} height={size} style={{ imageRendering: "pixelated" }} />;
}

function tasks(v: Voc, level: number) {
  return [
    {
      href: `/hunts/preparar?voc=${v}`,
      title: "Preparar para uma hunt",
      text: "Set, imbuements, combo e charm pela hunt escolhida.",
      icon: itemIcon("Soulshanks"),
    },
    v === "monk"
      ? {
          href: "/simulador?voc=monk",
          title: "Dano e DPS",
          text: "O monk ainda não tem simulador: veja por quê e o que já dá para usar.",
          icon: spellIcon("energy-wave"),
        }
      : {
          href: `/simulador?voc=${v}`,
          title: "Simular o dano",
          text: "Cada magia contra a hunt e a rotação que mais causa dano.",
          icon: spellIcon("energy-wave"),
        },
    {
      href: `/simulador/set?voc=${v}&level=${level}`,
      title: "Montar o set",
      text: "Item por slot, tier, imbuements e comparação de dois sets.",
      icon: itemIcon("Soulmantle"),
    },
    {
      href: `/planejador/wheel?voc=${v}&level=${level}`,
      title: "Wheel of Destiny",
      text: "A roda completa com o motor do tibia.com e builds prontas.",
      icon: spellIcon("Avatar of Storm"),
    },
    { href: `/rotacoes?voc=${v}#montador`, title: "Combos", text: "Montador com validação de cooldown e linha do tempo.", icon: spellIcon("hells-core") },
    { href: `/hunts`, title: "Fichas de hunt", text: "Resistência de cada bicho, ataques e level recomendado.", icon: itemIcon("Sanguine Coil") },
  ];
}

function TaskGrid({ v, level }: { v: Voc; level: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tasks(v, level).map((f) => (
        <Link key={f.title} href={f.href} className="flex gap-3 items-start border border-[#b98a5a] rounded p-3 bg-white/40 hover:bg-white/70 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {f.icon && <img src={f.icon} alt="" width={34} height={34} className="sprite shrink-0" />}
          <span>
            <span className="block font-bold text-[#3a1a00] text-[14px]">{f.title}</span>
            <span className="block text-[12px] mt-1">{f.text}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

function HuntList({ v, level }: { v: Voc; level: number }) {
  const { ok, next } = huntsFor(v, level);
  return (
    <div>
      {ok.length === 0 ? (
        <p className="text-[12px]">Nenhuma hunt do site com recomendação solo para essa vocação neste level.</p>
      ) : (
        <ul className="space-y-1 text-[12px]">
          {ok.map(({ h, min }) => (
            <li key={h.id} className="flex flex-wrap items-baseline gap-x-2">
              <Link href={`/hunts?h=${h.id}`} className="font-bold">
                {h.name}
              </Link>
              <span className="muted">({min}+)</span>
              <Link href={`/hunts/preparar?h=${h.id}&voc=${v}`} className="text-[11px]">
                preparar
              </Link>
            </li>
          ))}
        </ul>
      )}
      {next && (
        <p className="text-[11px] mt-2">
          Próxima: <Link href={`/hunts?h=${next.h.id}`}>{next.h.name}</Link> a partir do level {next.min}.
        </p>
      )}
      <p className="muted text-[10px] mt-1">Recomendação solo do TibiaPal para a vocação.</p>
    </div>
  );
}

export default function HomePanel({ initialVoc }: { initialVoc: Voc | null }) {
  const active = useActive();
  const voc = active.voc ?? initialVoc;
  const char = active.char;
  const [logged, setLogged] = useState<boolean | null>(null);
  const [chars, setChars] = useState<ActiveChar[]>([]);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [level, setLevel] = useState(800);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    const load = async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        setLogged(false);
        setChars([]);
        return;
      }
      setLogged(true);
      const { data } = await supabase.from("chars").select("id, name, vocation, level, magic_level, skill, world").order("created_at");
      setChars((data ?? []) as ActiveChar[]);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, []);

  // roda, set e combo salvos no char ativo
  useEffect(() => {
    if (!char || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    let alive = true;
    createClient()
      .from("chars")
      .select("id, wheel_code, set_code, combo_code, weapon_attack")
      .eq("id", char.id)
      .maybeSingle()
      .then(({ data }) => alive && setSaved((data as Saved) ?? null));
    return () => {
      alive = false;
    };
  }, [char]);

  // 1) ninguém escolheu nada ainda
  if (!voc && !char) {
    return (
      <Box title="Por onde começar">
        <p className="mb-3">Qual é a sua vocação? O site inteiro passa a abrir nela: simulador, set, Wheel, combos e hunts.</p>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {VOCS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setActiveVoc(v)}
              className="flex flex-col items-center text-center gap-1 border border-[#b98a5a] rounded p-3 bg-white/40 hover:bg-white/80"
            >
              <Outfit v={v} size={56} />
              <span className="font-bold text-[#3a1a00]">{VOC_LABEL[v]}</span>
              <span className="text-[11px]">{TAGLINE[v]}</span>
            </button>
          ))}
        </div>
        {logged === false && (
          <p className="text-[12px] mt-3">
            Já tem conta? <Link href="/entrar">Entre</Link> e o site usa o level, o magic level e a skill do seu char.
          </p>
        )}
      </Box>
    );
  }

  // 2) char ativo: resumo
  if (char) {
    const c = { ...char, ...(saved && saved.id === char.id ? saved : {}) };
    const milestone = WHEEL_MILESTONES.find((m) => m.level > char.level);
    const sim = simHref(c);
    const s = saved && saved.id === char.id ? saved : null;
    return (
      <Box title={`${char.name} · ${VOC_LABEL[char.vocation]} · level ${char.level}`}>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Outfit v={char.vocation} />
          <div className="text-[12px]">
            ML {char.magic_level}
            {char.skill ? ` · skill ${char.skill}` : ""}
            {char.world ? ` · ${char.world}` : ""}
            <div className="muted text-[11px]">
              Troque o char na barra do topo. <Link href="/minha-area">Minha área</Link> · <Link href={`/meus-chars/${char.id}`}>editar o char</Link>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h2 className="mt-0">Hunts para você</h2>
            <HuntList v={char.vocation} level={char.level} />
          </div>
          <div>
            <h2 className="mt-0">Seu char no site</h2>
            <div className="flex flex-col gap-2 items-start">
              <Link className="tc-btn" href={wheelHref(c)}>
                {s?.wheel_code ? "Abrir a roda salva" : "Montar a roda"}
              </Link>
              <Link className="tc-btn" href={setHref(c)}>
                {s?.set_code ? "Abrir o set salvo" : "Montar o set"}
              </Link>
              <Link className="tc-btn" href={comboHref(c)}>
                {s?.combo_code ? "Abrir o combo salvo" : "Montar um combo"}
              </Link>
            </div>
            {!s?.set_code && !s?.combo_code && (
              <p className="muted text-[11px] mt-2">Montou e gostou? O botão &quot;Salvar em {char.name}&quot; de cada ferramenta guarda aqui.</p>
            )}
          </div>
          <div>
            <h2 className="mt-0">Próximos passos</h2>
            <div className="flex flex-col gap-2 items-start">
              {sim && (
                <Link className="tc-btn" href={sim}>
                  Simular o dano deste char
                </Link>
              )}
              <Link className="tc-btn" href={`/hunts/preparar?voc=${char.vocation}`}>
                Preparar para uma hunt
              </Link>
            </div>
            {milestone && (
              <p className="text-[12px] mt-2">
                <b>Wheel no level {milestone.level}:</b> {milestone.text}
              </p>
            )}
          </div>
        </div>
      </Box>
    );
  }

  // 3) vocação escolhida, sem char
  const v = voc as Voc;
  const mine = chars.filter((c) => c.vocation === v);
  return (
    <Box title={`Você está como ${VOC_LABEL[v]}`}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Outfit v={v} />
        <p className="text-[12px] flex-1 min-w-[200px]">{TAGLINE[v]} Para trocar de vocação, use os bonecos na barra do topo.</p>
      </div>
      {logged && chars.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[12px]">
          <b>Continuar com:</b>
          {(mine.length ? mine : chars).map((c) => (
            <button key={c.id} type="button" className="tc-btn !py-0.5" onClick={() => setActiveChar(c)}>
              {c.name} ({c.level})
            </button>
          ))}
        </div>
      )}
      {logged && chars.length === 0 && (
        <p className="text-[12px] mb-3">
          <Link href="/meus-chars" className="font-bold">
            Cadastre seu char
          </Link>{" "}
          para o site usar o level, o magic level e a skill dele.
        </p>
      )}
      {logged === false && (
        <p className="text-[12px] mb-3">
          <Link href="/entrar" className="font-bold">
            Entre
          </Link>{" "}
          para o site usar o seu char e guardar roda, set e combo.
        </p>
      )}
      <TaskGrid v={v} level={level} />
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div>
          <h2 className="mt-0">Hunts para o seu level</h2>
          <label className="text-[12px] flex items-center gap-2 mb-2">
            Level
            <NumberInput className="w-24" min={8} max={5000} value={level} onValue={setLevel} />
          </label>
          <HuntList v={v} level={level} />
        </div>
        <div>
          <h2 className="mt-0">Mais usados</h2>
          <ul className="list-disc pl-5 space-y-1 text-[12px]">
            <li>
              <Link href={`/cooldowns?voc=${v}`}>Cooldowns de {VOC_LABEL[v]}</Link>
            </li>
            <li>
              <Link href={`/gemas?voc=${v}`}>Gemas e mods supremos</Link>
            </li>
            <li>
              <Link href={`/planejador/proficiencia?voc=${v}`}>Proficiência e catalisadores</Link>
            </li>
            <li>
              <Link href="/ferramentas/imbuements">Imbuements e lista de compras</Link>
            </li>
            <li>
              <Link href={`/vocacoes/${v}`}>Tudo sobre {VOC_LABEL[v]}</Link>
            </li>
          </ul>
        </div>
      </div>
    </Box>
  );
}
