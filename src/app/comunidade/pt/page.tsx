import { HUNTS } from "@/data/hunts";
import LookingForParty from "./LookingForParty";

export const metadata = { title: "Procura-se PT", description: "Quem está procurando PT agora e quem da guild está online." };
export const dynamic = "force-dynamic";

export default function PtPage() {
  return (
    <div>
      <h1>Procura-se PT</h1>
      <p className="on-dark mb-4">
        Quer fechar PT sem ficar gritando no Help? Anuncie a hunt e o horário: o anúncio fica 3 horas no ar e some sozinho. Do lado, quem das guildas está
        online agora, com level e vocação.
      </p>
      <LookingForParty hunts={HUNTS.map((h) => h.name)} />
    </div>
  );
}
