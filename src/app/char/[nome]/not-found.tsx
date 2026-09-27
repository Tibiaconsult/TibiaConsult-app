import Link from "next/link";
import Box from "@/components/Box";

export default function CharNotFound() {
  return (
    <div>
      <h1>Perfil não encontrado</h1>
      <Box title="Hmm...">
        <p className="text-[13px]">
          Esse char não tem perfil público aqui. O perfil aparece quando o dono libera o char na comunidade em <Link href="/meus-chars">Meus chars</Link>.
        </p>
      </Box>
    </div>
  );
}
