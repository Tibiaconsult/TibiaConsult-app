import Box from "@/components/Box";
import BosstiaryTracker from "./BosstiaryTracker";

export const metadata = { title: "Bosstiary" };

export default function BosstiaryPage() {
  return (
    <div>
      <h1>Bosstiary Tracker</h1>
      <p className="on-dark mb-4">
        Anote os kills de cada boss. O site mostra o estágio (Prowess, Expertise e Mastery), soma os boss points e calcula o bônus de loot do boss no slot.
      </p>
      <Box title="Bosstiary">
        <BosstiaryTracker />
      </Box>
    </div>
  );
}
