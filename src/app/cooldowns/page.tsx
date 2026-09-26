import Link from "next/link";
import Box from "@/components/Box";
import { SpellIcon } from "@/components/Icons";
import VocTabs, { parseVoc } from "@/components/VocTabs";
import { SPELLS, SUPPORT_SPELLS, ELEMENT_LABEL, SECONDARY_GROUP_LABEL } from "@/data/spells";
import { VOCATIONS } from "@/data/vocations";

export const metadata = { title: "Cooldowns" };

function SorcererTables() {
  return (
    <>
      <Box title="Feitiços e runas de ataque">
        <p className="mb-3">
          Grupo de ataque: 2 s entre qualquer feitiço ou runa. Hell&apos;s Core e Rage travam por 4 s. Quem divide grupo secundário não pode ser
          usado junto. O botão &quot;+ combo&quot; leva a magia para o montador de rotação.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Feitiço</th>
                <th>Palavras</th>
                <th>Lv</th>
                <th>Mana</th>
                <th>Base</th>
                <th>Elemento</th>
                <th>CD</th>
                <th>Trava ataque</th>
                <th>Grupo secundário</th>
                <th>Área</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {SPELLS.map((s) => (
                <tr key={s.id}>
                  <td className="font-bold">
                    <SpellIcon id={s.id} />
                    {s.name}
                    {s.notes && <div className="muted font-normal mt-0.5 text-[11px]">{s.notes}</div>}
                  </td>
                  <td className="whitespace-nowrap italic">{s.words}</td>
                  <td>{s.level}</td>
                  <td>{s.mana || "-"}</td>
                  <td>{s.base ?? "-"}</td>
                  <td>{s.element && <span className={`tag tag-${s.element}`}>{ELEMENT_LABEL[s.element]}</span>}</td>
                  <td className="whitespace-nowrap">{s.cooldown} s</td>
                  <td>{s.attackLock} s</td>
                  <td className="whitespace-nowrap">{s.secondary ? SECONDARY_GROUP_LABEL[s.secondary.group] : "-"}</td>
                  <td>{s.area}</td>
                  <td>
                    <Link className="tc-btn !py-0.5 !px-2 whitespace-nowrap" href={`/rotacoes?add=${s.id}#montador`}>
                      + combo
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
      <Box title="Suporte e defesa">
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Feitiço</th>
                <th>Palavras</th>
                <th>Mana</th>
                <th>Cooldown</th>
                <th>Efeito</th>
              </tr>
            </thead>
            <tbody>
              {SUPPORT_SPELLS.map((s) => (
                <tr key={s.name}>
                  <td className="font-bold whitespace-nowrap">
                    <SpellIcon id={s.name} />
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap italic">{s.words}</td>
                  <td>{s.mana}</td>
                  <td className="whitespace-nowrap">{s.cooldown}</td>
                  <td>{s.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    </>
  );
}

export default async function CooldownsPage({ searchParams }: { searchParams: Promise<{ voc?: string }> }) {
  const voc = parseVoc((await searchParams).voc);
  const v = voc === "sorcerer" ? null : VOCATIONS[voc];
  return (
    <div>
      <h1>Cooldowns</h1>
      <VocTabs base="/cooldowns" current={voc} />
      {!v ? (
        <SorcererTables />
      ) : (
        <>
          <Box title={`Magias de ${v.promoted}`}>
            <p className="mb-3">
              Grupo de ataque: cada magia trava as outras pelo tempo da coluna &quot;Trava ataque&quot;. Quem divide grupo secundário não pode ser
              usado junto. Magias da Wheel mostram o cooldown dos estágios 1, 2 e 3. O botão &quot;+ combo&quot; leva a magia para o montador de
              combos.
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Magia</th>
                    <th>Palavras</th>
                    <th>Lv</th>
                    <th>Mana</th>
                    <th>Base</th>
                    <th>Elemento</th>
                    <th>CD</th>
                    <th>Trava ataque</th>
                    <th>Grupo secundário</th>
                    <th>Área</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {v.spells.map((s) => (
                    <tr key={s.id}>
                      <td className="font-bold">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://static.tibia.com/images/library/${s.icon}.png`} alt="" width={22} height={22} className="inline-block align-middle mr-1" />
                        {s.name}
                        {s.revelation && <div className="muted font-normal text-[10px]">Wheel: {s.revelation}</div>}
                        {s.notes && <div className="muted font-normal mt-0.5 text-[11px]">{s.notes}</div>}
                      </td>
                      <td className="whitespace-nowrap italic">{s.words}</td>
                      <td>{s.level}</td>
                      <td>{s.mana || "-"}</td>
                      <td>{s.base ?? "-"}</td>
                      <td>{s.element === "weapon" ? <span className="tag tag-physical">Da arma</span> : <span className={`tag tag-${s.element}`}>{ELEMENT_LABEL[s.element]}</span>}</td>
                      <td className="whitespace-nowrap">{s.stageCooldown ? `${s.stageCooldown.join("/")} s` : `${s.cooldown} s`}</td>
                      <td>{s.lock} s</td>
                      <td className="whitespace-nowrap">{s.group ? `${s.group.label} (${s.group.cooldown} s)` : "-"}</td>
                      <td className="text-[11px]">{s.area}</td>
                      <td>
                        <Link className="tc-btn !py-0.5 !px-2 whitespace-nowrap" href={`/rotacoes?voc=${voc}&add=${s.id}#montador`}>
                          + combo
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Box>
          <Box title="Stances">
            <ul className="list-disc pl-5 space-y-1">
              {v.stances.map((s) => (
                <li key={s.name}>
                  <b>{s.name}:</b> {s.effect}
                </li>
              ))}
            </ul>
          </Box>
        </>
      )}
    </div>
  );
}
