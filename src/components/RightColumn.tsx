import Link from "next/link";
import { itemIcon, spellIcon } from "@/lib/icons";
import EventsToday from "./EventsToday";
import InstallGuide from "./InstallGuide";
import TavernPromo from "./TavernPromo";

function ThemeBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="tc-themebox">
      <div className="tc-themebox-title">{title}</div>
      <div className="tc-themebox-body">{children}</div>
    </div>
  );
}

export default function RightColumn() {
  const ew = spellIcon("energy-wave");
  return (
    <aside className="tc-right">
      <ThemeBox title="Eventos">
        <EventsToday />
      </ThemeBox>
      <TavernPromo />
      <ThemeBox title="Atalhos">
        <Link href="/simulador" className="tc-quick">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {ew && <img src={ew} alt="" width={32} height={32} />}
          <span>Simular dano</span>
        </Link>
        <Link href="/simulador/set" className="tc-quick">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={itemIcon("Soulmantle")} alt="" width={32} height={32} />
          <span>Montar set</span>
        </Link>
        <Link href="/planejador/wheel" className="tc-quick">
          {/* ícone de revelation do planner oficial (sprite de static.tibia.com) */}
          <span
            aria-hidden
            className="inline-block w-8 h-8 shrink-0 rounded-full"
            style={{ background: "url(https://static.tibia.com/images/community/wheelofdestiny/icons-skillwheel-largeperks.png) 0 0 / 512px 32px" }}
          />
          <span>Roda de habilidade</span>
        </Link>
        <Link href="/hunts" className="tc-quick">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={itemIcon("Sanguine Coil")} alt="" width={32} height={32} />
          <span>Fichas de hunt</span>
        </Link>
      </ThemeBox>
      <ThemeBox title="Instale o app">
        <InstallGuide compact />
      </ThemeBox>
      <ThemeBox title="Sobre os dados">
        <p>Números conferidos na TibiaWiki e no tibia.com. Onde a fórmula não é oficial, o site avisa e deixa você calibrar.</p>
      </ThemeBox>
    </aside>
  );
}
