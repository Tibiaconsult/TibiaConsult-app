import Box from "@/components/Box";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata = { title: "Reportar ou sugerir" };

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams;
  return (
    <div className="max-w-2xl">
      <h1>Reportar ou sugerir</h1>
      <Box title="Fale com a gente">
        <p className="mb-3">
          Achou um bug ou um número errado? Tem uma hunt que merece ficha, ou uma ideia de ferramenta? Mande por aqui. Tudo é lido.
        </p>
        <FeedbackForm initialKind={tipo ?? "bug"} />
      </Box>
    </div>
  );
}
