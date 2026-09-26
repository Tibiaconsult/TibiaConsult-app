import { WEAPON_UPGRADES } from "@/data/weapon-upgrades";

/** Tabela "arma comum x Grand Sanguine / Stellar Moonsilver" de uma vocação. Agrupa tipos de arma com as mesmas diferenças. */
export default function WeaponUpgrades({ voc }: { voc: string }) {
  const rows = WEAPON_UPGRADES[voc] ?? [];
  const groups: { kinds: string[]; base: string; top: string; diffs: (typeof rows)[number]["diffs"] }[] = [];
  for (const r of rows) {
    const key = r.base + JSON.stringify(r.diffs);
    const g = groups.find((x) => x.base + JSON.stringify(x.diffs) === key);
    if (g) g.kinds.push(r.kind);
    else groups.push({ kinds: [r.kind], base: r.base, top: r.top, diffs: r.diffs });
  }
  if (!groups.length) return null;
  return (
    <div className="space-y-4">
      <p className="text-[12px]">
        Sanguine e Grand Sanguine são itens diferentes, e o mesmo vale para Moonsilver e Stellar Moonsilver. Ataque, skill, magic level e proteção
        são iguais; a versão melhorada tem perks de proficiência mais fortes. Os demais perks são iguais nas duas.
      </p>
      {groups.map((g) => (
        <div key={g.top + g.kinds.join()}>
          <div className="font-bold text-[13px] text-[#3a1a00]">
            {g.base} x {g.top}: {g.kinds.join(", ").toLowerCase()}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Nível</th>
                  <th>{g.base}</th>
                  <th>{g.top}</th>
                </tr>
              </thead>
              <tbody>
                {g.diffs.map((d, i) => (
                  <tr key={i}>
                    <td>{d.level}</td>
                    <td className="text-[11px]">{d.from}</td>
                    <td className="text-[11px] font-bold good">{d.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      <p className="muted text-[10px]">Fonte: TibiaWiki, Weapon Proficiency Tables, consulta em 26/09/2026. Textos dos perks como aparecem na wiki.</p>
    </div>
  );
}
