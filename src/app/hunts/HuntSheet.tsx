import Link from "next/link";
import type { Hunt } from "@/data/hunts";
import { HUNT_RECS, REC_SOURCE, REC_VOC_LABEL, RecVoc } from "@/data/hunt-recs";
import { creatureHref } from "@/lib/creature-labels";
import { creatureIcon } from "@/lib/icons";
import GuildHuntStats from "./GuildHuntStats";
import VocSets from "./VocSets";

function pct(v: number) {
  const cls = v === 0 ? "bad" : v >= 110 ? "good" : v < 70 ? "warn" : "";
  return <span className={cls}>{v}%</span>;
}

/** Ficha completa de uma hunt. */
export default function HuntSheet({ h }: { h: Hunt }) {
  const rec = HUNT_RECS[h.id];
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Link className="tc-btn" href={`/hunts/preparar?h=${h.id}`}>
          Preparar para esta hunt
        </Link>
        <Link className="tc-btn" href={`/simulador?hunt=${h.id}`}>
          Simular o dano nesta hunt
        </Link>
      </div>
      <p>{h.access}</p>
      <ul className="list-disc pl-5 mt-2">
        {h.floors.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      {rec && (
        <div className="border border-[#b98a5a] rounded p-3 bg-white/40 mt-3">
          <div className="font-bold mb-1">Level recomendado</div>
          <div className="flex flex-wrap gap-2 text-[12px]">
            {(Object.keys(REC_VOC_LABEL) as RecVoc[]).map((v) => (
              <span key={v} className={`border rounded px-2 py-0.5 ${rec.solo[v] ? "border-[#5a7d2a] bg-[#dfe9c8]" : "border-[#c9b089] opacity-60"}`}>
                {REC_VOC_LABEL[v]} solo: {rec.solo[v] ? `${rec.solo[v]}+` : "não listado"}
                {rec.style?.[v] ? ` · ${rec.style[v]}` : ""}
              </span>
            ))}
            <span className={`border rounded px-2 py-0.5 ${rec.team ? "border-[#3a5a8a] bg-[#dde6f3]" : "border-[#c9b089] opacity-60"}`}>
              PT: {rec.team ? `${rec.team}+` : "não listado"}
            </span>
          </div>
          {rec.detail && <p className="text-[11px] mt-1">{rec.detail}</p>}
          <p className="muted text-[10px] mt-1">Fonte: {REC_SOURCE}.</p>
        </div>
      )}
      <GuildHuntStats huntId={h.id} />

      <div className="overflow-x-auto mt-4">
        <table>
          <thead>
            <tr>
              <th>Creature</th>
              <th>HP</th>
              <th>Exp</th>
              <th>Fís</th>
              <th>Death</th>
              <th>Holy</th>
              <th>Gelo</th>
              <th>Fogo</th>
              <th>Energia</th>
              <th>Terra</th>
              <th>Ataques</th>
            </tr>
          </thead>
          <tbody>
            {h.creatures.map((c) => (
              <tr key={c.name}>
                <td className="font-bold whitespace-nowrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creatureIcon(c.name)} alt="" width={32} height={32} loading="lazy" className="sprite inline-block align-middle mr-1" />
                  <Link href={creatureHref(c.name)} title="Ficha da creature: atributos, bestiário e loot">
                    {c.name}
                  </Link>
                </td>
                <td>{c.hp.toLocaleString("pt-BR")}</td>
                <td>{c.exp.toLocaleString("pt-BR")}</td>
                <td>{pct(c.taken.physical)}</td>
                <td>{pct(c.taken.death)}</td>
                <td>{pct(c.taken.holy)}</td>
                <td>{pct(c.taken.ice)}</td>
                <td>{pct(c.taken.fire)}</td>
                <td>{pct(c.taken.energy)}</td>
                <td>{pct(c.taken.earth)}</td>
                <td>{c.attacks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4">
        <span className="font-bold">Elemento para sorcerer: </span>
        {h.element}
      </p>
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div>
          <h2 className="mt-0">Set por vocação</h2>
          <VocSets h={h} />
        </div>
        <div>
          <h2 className="mt-0">Como jogar</h2>
          <ul className="list-disc pl-5 space-y-1">
            {h.play.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {h.warning && <p className="warn mt-3">{h.warning}</p>}
          <p className="mt-3 text-[12px]">
            <Link href={`/hunts/preparar?h=${h.id}`}>Preparar para esta hunt</Link>: set, imbuements, combo e charm já montados para a sua vocação.
          </p>
        </div>
      </div>
    </div>
  );
}
