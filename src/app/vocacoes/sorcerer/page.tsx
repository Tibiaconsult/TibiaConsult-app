import Link from "next/link";
import Box from "@/components/Box";
import WeaponUpgrades from "@/components/WeaponUpgrades";
import { spellIcon } from "@/lib/icons";

export const metadata = { title: "Master Sorcerer" };

const SECTIONS = [
  { href: "/simulador", title: "Simulador de dano e DPS", text: "Dano por feitiço contra a hunt, ranking de elemento, DPS das rotações, com set, Wheel e proficiência.", icon: "energy-wave" },
  { href: "/rotacoes", title: "Rotações por elemento", text: "Energia, fogo e death com as stances de 06/2026, burst e montador de rotação própria.", icon: "hells-core" },
  { href: "/cooldowns", title: "Feitiços e cooldowns", text: "Base, mana, cooldown, grupo secundário e área de cada feitiço e runa.", icon: "great-energy-beam" },
  { href: "/gemas", title: "Gemas", text: "Mods básicos e supremos por domínio da Wheel e builds sugeridas.", icon: "death-echo" },
  { href: "/equipamento", title: "Equipamento", text: "Melhor peça por slot, imbuements e a diferença entre as versões das wands.", icon: "great-fire-wave" },
  { href: "/planejador/wheel", title: "Wheel of Destiny", text: "A roda completa com o motor do tibia.com, gemas e builds prontas.", icon: "rage-of-the-skies" },
  { href: "/planejador/proficiencia/wand", title: "Proficiência da wand", text: "Árvores da Sanguine, Grand Sanguine, Moonsilver e Stellar Moonsilver, com efeito no simulador.", icon: "ultimate-energy-strike" },
  { href: "/simulador/set", title: "Montador de set", text: "Bônus total do set, comparação entre dois sets e envio para o simulador.", icon: "strong-flame-strike" },
  { href: "/simulador/mana", title: "Magic Shield e mana", text: "Escudo, poções e sustentação por minuto.", icon: "Magic Shield" },
];

export default function SorcererPage() {
  return (
    <div>
      <h1>Master Sorcerer</h1>
      <p className="on-dark mb-4">
        A vocação mais completa do site. Desde 06/2026 o sorcerer escolhe o elemento da rotação com Master of Flames, Master of Thunder ou Master
        of Decay, e cada feitiço do elemento da stance converte o próximo feitiço de outro elemento.
      </p>
      <Box title="Tudo sobre o sorcerer">
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => {
            const ic = spellIcon(s.icon);
            return (
              <Link key={s.href} href={s.href} className="border border-[#b98a5a] rounded p-3 bg-white/40 block hover:bg-white/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {ic && <img src={ic} alt="" width={28} height={28} className="inline-block align-middle mr-2" />}
                <b>{s.title}</b>
                <p className="text-[12px] mt-1">{s.text}</p>
              </Link>
            );
          })}
        </div>
      </Box>
      <Box title="Sanguine Coil x Grand Sanguine Coil e Moonsilver x Stellar Moonsilver">
        <WeaponUpgrades voc="sorcerer" />
      </Box>
    </div>
  );
}
