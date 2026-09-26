"use client";

import { spellIcon } from "@/lib/icons";
import { AUGMENTS, AugmentId, DOMAINS, SUPREME_OPTIONS, WheelConfig, availablePoints, stages } from "@/lib/wheel";

// Ajuste rápido da Wheel do sorcerer dentro do simulador (antigo planejador "Wheel: efeitos"): só o que mexe em dano e cooldown.
// A roda completa, com slices e o motor do tibia.com, fica em /planejador/wheel e manda o resultado para cá.

const STAGE_LABEL = ["bloqueado", "estágio 1", "estágio 2", "estágio 3"];
const REV_ICON: Record<string, string | null> = {
  "Gift of Life": null,
  "Beam Mastery": spellIcon("great-energy-beam"),
  "Lord of Destruction": spellIcon("Master of Flames"),
  "Avatar of Storm": spellIcon("Avatar of Storm"),
};

export default function WheelEffectsEditor({ value: w, onChange, level }: { value: WheelConfig; onChange: (w: WheelConfig) => void; level: number }) {
  const total = availablePoints({ ...w, level });
  const spent = Object.values(w.points).reduce((a, b) => a + b, 0);
  const st = stages(w);
  const setW = (patch: Partial<WheelConfig>) => onChange({ ...w, ...patch, level });
  const setPts = (id: keyof WheelConfig["points"], v: number) => setW({ points: { ...w.points, [id]: Math.max(0, v) } });
  const setAug = (id: AugmentId, v: 0 | 1 | 2) => setW({ augments: { ...w.augments, [id]: v } });

  return (
    <div className="space-y-4 text-[12px]">
      <div className="flex flex-wrap gap-4 items-end">
        <label>
          <span className="font-bold block">Pontos extras (Bakragore, Task Shop, gemas IV)</span>
          <input type="number" className="mt-1 w-28" value={w.extraPoints} onChange={(e) => setW({ extraPoints: Math.max(0, Number(e.target.value) || 0) })} />
        </label>
        <div className={`font-bold ${spent > total ? "bad" : "good"}`}>
          Pontos usados: {spent} de {total} no level {level} {spent > total && "(passou do limite)"}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DOMAINS.map((d) => (
          <div key={d.id} className="border border-[#b98a5a] rounded p-2 bg-white/40 flex gap-2 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {REV_ICON[d.revelation] && <img src={REV_ICON[d.revelation]!} alt="" width={32} height={32} className="sprite" />}
            <div className="flex-1">
              <div className="muted text-[10px]">{d.name}</div>
              <div className="font-bold text-[#3a1a00]">{d.revelation}</div>
              <input
                type="number"
                step={25}
                min={0}
                className="mt-1 w-24"
                aria-label={`Pontos em ${d.revelation}`}
                value={w.points[d.id]}
                onChange={(e) => setPts(d.id, Number(e.target.value) || 0)}
              />
              <div className={st[d.id] > 0 ? "good" : "muted"}>{STAGE_LABEL[st[d.id]]}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="muted text-[11px]">Estágios: 250, 500 e 1000 pontos no domínio. Revelation Mastery em gema soma a esses pontos.</p>

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
                <input type="checkbox" checked={w.focusMastery} onChange={(e) => setW({ focusMastery: e.target.checked })} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <div className="font-bold mb-1">Mods supremos das Greater Sage Gems</div>
        <div className="space-y-2">
          {w.gems.map((g, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-center">
              <select
                value={g.supreme}
                onChange={(e) => {
                  const gems = [...w.gems];
                  gems[i] = { ...g, supreme: e.target.value };
                  setW({ gems });
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
                  setW({ gems });
                }}
              >
                {[1, 2, 3, 4].map((x) => (
                  <option key={x} value={x}>
                    grade {["I", "II", "III", "IV"][x - 1]}
                  </option>
                ))}
              </select>
              <button type="button" className="tc-btn tc-btn-danger !py-0.5" onClick={() => setW({ gems: w.gems.filter((_, j) => j !== i) })}>
                remover
              </button>
            </div>
          ))}
          {w.gems.length < 4 && (
            <button type="button" className="tc-btn" onClick={() => setW({ gems: [...w.gems, { supreme: "", grade: 1 }] })}>
              + gema
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
