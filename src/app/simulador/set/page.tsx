import Link from "next/link";
import SetTabs from "./SetTabs";

export const metadata = { title: "Montador de set" };

export default function SetPage() {
  return (
    <div>
      <h1>Montador de set</h1>
      <SetTabs />
      <p className="on-dark text-[11px] mt-2">
        Quer ver todos os itens de um slot lado a lado? <Link href="/equipamento">Itens por slot</Link>.
      </p>
    </div>
  );
}
