import Link from "next/link";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { TibiaEvent, eventInfo, fmtDay, withAnnounced } from "@/lib/tibiaEvents";

/** "Hoje no Tibia": evento acontecendo agora e o próximo, com link para o calendário. */
export default async function EventsToday() {
  if (!hasSupabaseEnv()) return null;
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const supabase = await createClient();
  const { data } = await supabase.from("tibia_events").select("id, name, start_date, end_date, tentative").gte("end_date", today).order("start_date").limit(6);
  const list = withAnnounced((data ?? []) as TibiaEvent[], today);
  // previsão que já devia ter começado sem notícia confirmando: não mostra como "agora"
  const now = list.filter((e) => e.start_date <= today && !e.tentative);
  const next = list.find((e) => e.start_date > today);
  if (!now.length && !next) return null;
  return (
    <div className="text-[11px] leading-tight border-t border-[#444] pt-2">
      {now.map((e) => (
        <div key={e.id}>
          <span className="muted text-[10px]">Agora:</span> {eventInfo(e.name).emoji} <b>{eventInfo(e.name).pt}</b>{" "}
          <span className="text-[10px]">até {fmtDay(e.end_date)}</span>
        </div>
      ))}
      {next && (
        <div className="mt-0.5">
          <span className="muted text-[10px]">Próximo:</span> {eventInfo(next.name).emoji} <b>{eventInfo(next.name).pt}</b>{" "}
          <span className="text-[10px]">
            {fmtDay(next.start_date)}
            {next.tentative ? " (previsão)" : ""}
          </span>
        </div>
      )}
      <Link href="/tibia/calendario" className="text-[10px]">
        ver calendário →
      </Link>
    </div>
  );
}
