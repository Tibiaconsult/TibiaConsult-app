import Link from "next/link";
import { notFound } from "next/navigation";
import Box from "@/components/Box";
import { ItemSprite } from "@/components/Icons";
import { ELEMENT_LABEL } from "@/data/spells";
import { VOCATIONS, VOC_IDS, VocId } from "@/data/vocations";
import EquipmentBySlot from "./EquipmentBySlot";
import WeaponUpgrades from "@/components/WeaponUpgrades";

export function generateStaticParams() {
  return VOC_IDS.map((voc) => ({ voc }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ voc: string }>;
}) {
  const { voc } = await params;
  const v = VOCATIONS[voc as VocId];
  return { title: v ? v.promoted : "Vocação" };
}

const SCALE_LABEL = {
  ml: "Magic level",
  skill: "Skill + ataque",
  shield: "Defesa do escudo",
  dot: "Ao longo do tempo",
  monk: "Fist + arma + Harmony",
};

export default async function VocationPage({
  params,
}: {
  params: Promise<{ voc: string }>;
}) {
  const { voc } = await params;
  const v = VOCATIONS[voc as VocId];
  if (!v) notFound();

  return (
    <div>
      <h1>{v.promoted}</h1>
      <p className="on-dark mb-4">{v.intro}</p>

      <Box title={`Atalhos de ${v.promoted}`}>
        <div className="flex flex-wrap gap-2">
          {[
            [`/simulador/set?voc=${v.id}`, "🛡️ Montar set"],
            [`/rotacoes?voc=${v.id}`, "🔁 Combos e cooldowns"],
            [`/simulador?voc=${v.id}`, "💥 Simulador de dano"],
            [`/hunts/preparar?voc=${v.id}`, "🎒 Preparar para a hunt"],
            [`/planejador/proficiencia?voc=${v.id}`, "⚔️ Proficiência"],
            [`/gemas?voc=${v.id}`, "💎 Gemas"],
            [`/equipamento?voc=${v.id}`, "🧰 Itens por slot"],
          ].map(([href, label]) => (
            <Link key={href} className="tc-btn !py-0.5" href={href}>
              {label}
            </Link>
          ))}
        </div>
      </Box>

      <Box title="Stances (desde 06/2026)">
        <div className="grid gap-3 sm:grid-cols-2">
          {v.stances.map((s) => (
            <div
              key={s.name}
              className="border border-[#b98a5a] rounded p-3 bg-white/40"
            >
              <div className="font-bold">{s.name}</div>
              <p className="text-[12px] mt-1">{s.effect}</p>
            </div>
          ))}
        </div>
      </Box>

      <div id="simulador" className="scroll-mt-20" />
      <Box title="Simulador de dano e rotação">
        {v.id === "monk" ? (
          <p className="text-[12px]">
            O simulador do monk ainda não está disponível: o dano das magias de monk depende de um fator próprio de cada magia, e esse fator não é
            público. Em vez de chutar, esta página mostra as magias, a Harmony e a Wheel com os números conferidos.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[12px] flex-1 min-w-[220px]">
              O simulador de todas as vocações fica numa página só: magias contra a hunt, rotação que mais causa dano, Wheel e calibração por hit
              real. Abre já em {v.promoted} e, com login, no level do seu char.
            </p>
            <Link className="tc-btn" href={`/simulador?voc=${v.id}`}>
              Abrir o simulador de {v.promoted}
            </Link>
          </div>
        )}
      </Box>

      <Box title="Magias de ataque e cooldowns">
        <p className="mb-2 text-[12px]">
          <Link className="tc-btn !py-0.5" href={`/rotacoes?voc=${v.id}`}>
            Montar combo de {v.promoted}
          </Link>{" "}
          <Link className="tc-btn !py-0.5" href={`/cooldowns?voc=${v.id}`}>
            Tabela de cooldowns
          </Link>
        </p>
        <p className="mb-3 text-[12px]">
          Grupo de ataque: 2 s entre qualquer magia ou runa de ataque (4 s
          depois de Eternal Winter e Wrath of Nature). Magias do mesmo grupo
          secundário não podem ser usadas juntas.
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
                <th>Escala</th>
                <th>CD</th>
                <th>Grupo secundário</th>
                <th>Área</th>
              </tr>
            </thead>
            <tbody>
              {v.spells.map((s) => (
                <tr key={s.id}>
                  <td className="font-bold">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://static.tibia.com/images/library/${s.icon}.png`}
                      alt=""
                      width={22}
                      height={22}
                      className="inline-block align-middle mr-1"
                    />
                    {s.name}
                    {s.revelation && (
                      <div className="muted font-normal text-[10px]">
                        Wheel: {s.revelation}
                      </div>
                    )}
                    {s.notes && (
                      <div className="muted font-normal mt-0.5 text-[11px]">
                        {s.notes}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap italic">{s.words}</td>
                  <td>{s.level}</td>
                  <td>{s.mana || "-"}</td>
                  <td>{s.base ?? "não publicado"}</td>
                  <td>
                    {s.element === "weapon" ? (
                      <span className="tag tag-physical">Da arma</span>
                    ) : (
                      <span className={`tag tag-${s.element}`}>
                        {ELEMENT_LABEL[s.element]}
                      </span>
                    )}
                  </td>
                  <td className="text-[11px]">{SCALE_LABEL[s.scale]}</td>
                  <td className="whitespace-nowrap">
                    {s.stageCooldown
                      ? s.stageCooldown.join("/") + " s"
                      : `${s.cooldown} s`}
                  </td>
                  <td>
                    {s.group ? `${s.group.label} (${s.group.cooldown} s)` : "-"}
                  </td>
                  <td className="text-[11px]">{s.area}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>

      <Box title="Wheel of Destiny">
        <h2>Revelations</h2>
        <p className="text-[12px] mb-2">
          Cada estágio (250, 500 e 1000 pontos no domínio) também dá +4, +9 e
          +20 de dano e cura.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {v.revelations.map((r) => (
            <div
              key={r.name}
              className="border border-[#b98a5a] rounded p-3 bg-white/40"
            >
              <div className="font-bold">{r.name}</div>
              <p className="text-[12px] mt-1">{r.effect}</p>
            </div>
          ))}
        </div>
        <h2 className="mt-4">Convictions próprias</h2>
        <ul className="list-disc pl-5 text-[12px]">
          {v.convictions.map((c) => (
            <li key={c.name}>
              <b>{c.name}:</b> {c.effect}
            </li>
          ))}
        </ul>
        <h2 className="mt-4">Augments</h2>
        <table>
          <thead>
            <tr>
              <th>Magia</th>
              <th>Estágio 1</th>
              <th>Estágio 2</th>
            </tr>
          </thead>
          <tbody>
            {v.augments.map((a) => (
              <tr key={a.label}>
                <td className="font-bold">{a.label}</td>
                <td>{a.t1}</td>
                <td>{a.t2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box title="Gemas: mods supremos da vocação">
        <p className="text-[12px] mb-2">
          Só saem em Greater Gem. Somam com a Wheel e com os augments dos itens.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Mod</th>
                <th>Grau I</th>
                <th>Grau II</th>
                <th>Grau III</th>
                <th>Grau IV</th>
              </tr>
            </thead>
            <tbody>
              {v.supreme.map((m) => (
                <tr key={m.mod}>
                  <td className="font-bold">{m.mod}</td>
                  {m.values.map((x, i) => (
                    <td key={i}>{x}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>

      {v.weapons.length > 0 && (
        <Box title="Armas de ponta">
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Arma</th>
                  <th>Lv</th>
                  <th>Tipo</th>
                  <th>Mãos</th>
                  <th>Ataque</th>
                  <th>Bônus</th>
                  <th>Proteção</th>
                </tr>
              </thead>
              <tbody>
                {v.weapons.map((w) => (
                  <tr key={w.name}>
                    <td className="font-bold whitespace-nowrap">
                      <ItemSprite name={w.name} />
                      {w.name}
                    </td>
                    <td>{w.level}</td>
                    <td>{w.kind}</td>
                    <td>{w.hands}</td>
                    <td>{w.attack}</td>
                    <td>{w.bonus}</td>
                    <td>{w.resist ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted text-[11px] mt-2">{v.weaponNote}</p>
        </Box>
      )}

      <Box title="Arma comum x Grand Sanguine e Stellar Moonsilver">
        <WeaponUpgrades voc={v.id} />
      </Box>

      <Box title="Equipamento por slot">
        <EquipmentBySlot voc={v.id} />
      </Box>

      <Box title="Dicas rápidas">
        <ul className="list-disc pl-5 text-[12px] space-y-1">
          {v.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="muted text-[11px] mt-3">
          Fonte: TibiaWiki (feitiços, Wheel of Destiny, Supreme Mod e as notas
          do Vocation Adjustments de 16/06/2026 e do patch de 07/07/2026),
          consultada em 26/09/2026.
        </p>
      </Box>
    </div>
  );
}
