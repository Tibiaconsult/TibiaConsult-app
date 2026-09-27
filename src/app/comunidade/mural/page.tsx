import { redirect } from "next/navigation";

// O Caixão e Vela Preta virou a aba de mortes da Taverna; o endereço antigo continua valendo.
export default async function MuralPage({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  const { g } = await searchParams;
  redirect(`/comunidade/taverna?ver=mortes${g ? `&g=${encodeURIComponent(g)}` : ""}`);
}
