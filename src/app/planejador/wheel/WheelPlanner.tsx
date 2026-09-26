"use client";

import { useEffect, useMemo, useState } from "react";
import { spellIcon } from "@/lib/icons";
import { AUGMENTS, AugmentId, DOMAINS, SUPREME_OPTIONS, WheelConfig, availablePoints, decodeWheel, defaultWheel, encodeWheel, stages, wheelEffects } from "@/lib/wheel";

const STAGE_LABEL = ["bloqueado", "estágio 1", "estágio 2", "estágio 3"];
const REV_ICON: Record<string, string | null> = {
  "Gift of Life": null,
  "Beam Mastery": spellIcon("great-energy-beam"),
  "Lord of Destruction": spellIcon("Master of Flames"),
  "Avatar of Storm": spellIcon("Avatar of Storm"),
};

export default function WheelPlanner() {
  const [w, setW] = useState<WheelConfig>(() => defaultWheel());
  const [copied, setCopied] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Lê a Wheel compartilhada pela URL uma vez, depois da hidratação.
    const p = new URLSearchParams(window.location.search);
    const fromUrl = decodeWheel(p.get("wheel"));
    if (fromUrl) setW(fromUrl);
    else if (p.get("level")) setW((x) => ({ ...x, level: Number(p.get("level")) || x.level }));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const total = availablePoints(w);
  const spent = Object.values(w.points).reduce((a, b) => a + b, 0);
  const st = useMemo(() => stages(w), [w]);
  const fx = useMemo(() => wheelEffects(w), [w]);

  const setPts = (id: keyof WheelConfig["points"], v: number) => setW({ ...w, points: { ...w.points, [id]: Math.max(0, v) } });
  const setAug = (id: AugmentId, v: 0 | 1 | 2) => setW({ ...w, augments: { ...w.augments, [id]: v } });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label>
          Level
          <input type="number" className="mt-1 w-full" value={w.level} onChange={(e) => setW({ ...w, level: Number(e.target.value) || 51 })} />
        </label>
        <label>
          Pontos extras (Bakragore, Task Shop, gemas IV)
          <input type="number" className="mt-1 w-full" value={w.extraPoints} onChange={(e) => setW({ ...w, extraPoints: Math.max(0, Number(e.target.value) || 0) })} />
        </label>
        <div className={`self-end font-bold ${spent > total ? "bad" : "good"}`}>
          Pontos usados: {spent} de {total} {spent > total && "(passou do limite)"}
        </div>
      </div>

      <h2>Domínios e revelations</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {DOMAINS.map((d) => (
          <div key={d.id} className="border border-[#b98a5a] rounded p-3 bg-white/40 flex gap-3 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {REV_ICON[d.revelation] && <img src={REV_ICON[d.revelation]!} alt="" width={38} height={38} className="sprite" />}
            <div className="flex-1">
              <div className="muted text-[11px]">{d.name}</div>
              <div className="font-bold text-[#3a1a00]">{d.revelation}</div>
              <label className="block mt-1">
                Pontos no domínio
                <input type="number" step={25} min={0} className="mt-1 w-28" value={w.points[d.id]} onChange={(e) => setPts(d.id, Number(e.target.value) || 0)} />
              </label>
              <div className={st[d.id] > 0 ? "good" : "muted"}>{STAGE_LABEL[st[d.id]]}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="muted text-[11px]">Estágios: 250, 500 e 1000 pontos no domínio. Revelation Mastery em gema soma a esses pontos. Cada revelation dá +4, +9 ou +20 de dano e cura.</p>

      <h2>Augments (convictions nas bordas)</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Augment</th>
              <th>Estágio 1</th>
              <th>Estágio 2</th>
              <th>Seu estágio</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(AUGMENTS) as AugmentId[]).map((id) => (
              <tr key={id}>
                <td className="font-bold">{AUGMENTS[id].label}</td>
                <td>{AUGMENTS[id].t1}</td>
                <td>{AUGMENTS[id].t2}</td>
                <td>
                  <select value={w.augments[id]} onChange={(e) => setAug(id, Number(e.target.value) as 0 | 1 | 2)}>
                    <option value={0}>nenhum</option>
                    <option value={1}>estágio 1</option>
                    <option value={2}>estágio 2</option>
                  </select>
                </td>
              </tr>
            ))}
            <tr>
              <td className="font-bold">Focus Mastery</td>
              <td colSpan={2}>+35% no próximo feitiço até 12 s depois de Rage ou Hell&apos;s Core; −2 s no grupo Focus</td>
              <td>
                <input type="checkbox" checked={w.focusMastery} onChange={(e) => setW({ ...w, focusMastery: e.target.checked })} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Mods supremos das Greater Sage Gems</h2>
      <div className="space-y-2">
        {w.gems.map((g, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center">
            <select
              value={g.supreme}
              onChange={(e) => {
                const gems = [...w.gems];
                gems[i] = { ...g, supreme: e.target.value };
                setW({ ...w, gems });
              }}
            >
              {SUPREME_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={g.grade}
              onChange={(e) => {
                const gems = [...w.gems];
                gems[i] = { ...g, grade: Number(e.target.value) as 1 | 2 | 3 | 4 };
                setW({ ...w, gems });
              }}
            >
              {[1, 2, 3, 4].map((x) => (
                <option key={x} value={x}>
                  grade {["I", "II", "III", "IV"][x - 1]}
                </option>
              ))}
            </select>
            <button type="button" className="tc-btn tc-btn-danger !py-0.5" onClick={() => setW({ ...w, gems: w.gems.filter((_, j) => j !== i) })}>
              remover
            </button>
          </div>
        ))}
        {w.gems.length < 4 && (
          <button type="button" className="tc-btn" onClick={() => setW({ ...w, gems: [...w.gems, { supreme: "", grade: 1 }] })}>
            + gema
          </button>
        )}
      </div>

      <h2>Efeito no dano</h2>
      <table>
        <tbody>
          <tr>
            <td>Dano e cura flat (revelations)</td>
            <td className="font-bold">+{fx.flatBonus}</td>
          </tr>
          <tr>
            <td>Lord of Destruction</td>
            <td>{STAGE_LABEL[fx.lordOfDestruction]}</td>
          </tr>
          <tr>
            <td>Beam Mastery</td>
            <td>{STAGE_LABEL[fx.beamMastery]}</td>
          </tr>
          <tr>
            <td>Base damage extra</td>
            <td>
              {Object.entries(fx.basePowerBonus)
                .map(([k, v]) => `${k.replace(/-/g, " ")} +${Math.round(v * 1000) / 10}%`)
                .join(" · ") || "-"}
            </td>
          </tr>
          <tr>
            <td>Crit por feitiço</td>
            <td>
              {[
                ...Object.entries(fx.spellCritChance).map(([k, v]) => `${k.replace(/-/g, " ")} +${Math.round(v * 100)}% chance`),
                ...Object.entries(fx.spellCritExtra).map(([k, v]) => `${k.replace(/-/g, " ")} +${Math.round(v * 1000) / 10}% extra`),
              ].join(" · ") || "-"}
            </td>
          </tr>
          <tr>
            <td>Cooldowns</td>
            <td>
              {[
                fx.modifiers.focusMastery && "Focus −2 s",
                fx.modifiers.focusAugmentT2 && "Focus −4 s",
                fx.modifiers.specialAugmentT1 && "Special −4 s",
                fx.modifiers.deathEchoAugmentT1 && "Death Echo −2 s",
                fx.modifiers.energyWaveGem && "Energy Wave −1 s",
              ]
                .filter(Boolean)
                .join(" · ") || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-wrap gap-3">
        <a className="tc-btn" href={`/simulador?level=${w.level}&wheel=${encodeWheel(w)}`}>
          Usar esta Wheel no simulador de dano
        </a>
        <button
          type="button"
          className="tc-btn"
          onClick={async () => {
            const u = `${window.location.origin}/planejador/wheel?wheel=${encodeWheel(w)}`;
            try {
              await navigator.clipboard.writeText(u);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              window.prompt("Copie o link:", u);
            }
          }}
        >
          {copied ? "Link copiado" : "Copiar link"}
        </button>
        <a className="tc-btn" href="https://www.tibia.com/community/?subtopic=wheelofdestinyplanner" target="_blank" rel="noreferrer">
          Planner oficial (slices completos)
        </a>
      </div>
      <p className="muted text-[11px]">
        Este planejador cuida só do que muda dano e cooldown. A posição exata das slices, HP, mana e mitigação ficam no planner oficial do tibia.com.
      </p>
    </div>
  );
}
