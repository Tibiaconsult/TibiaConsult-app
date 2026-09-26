import Link from "next/link";
import { itemIcon, spellIcon } from "@/lib/icons";
import Boosted from "./Boosted";

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
      <ThemeBox title="Boostados hoje">
        <Boosted compact />
      </ThemeBox>
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
        <Link href="/hunts" className="tc-quick">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={itemIcon("Sanguine Coil")} alt="" width={32} height={32} />
          <span>Fichas de hunt</span>
        </Link>
      </ThemeBox>
      <ThemeBox title="Instale o app">
        <p>No celular, abra o menu do navegador e toque em &quot;Adicionar à tela inicial&quot;. No PC, use o ícone de instalar na barra de endereço.</p>
      </ThemeBox>
      <ThemeBox title="Sobre os dados">
        <p>Números conferidos na TibiaWiki e no tibia.com. Onde a fórmula não é oficial, o site avisa e deixa você calibrar.</p>
      </ThemeBox>
    </aside>
  );
}
