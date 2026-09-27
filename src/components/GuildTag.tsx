/** Etiqueta com o nome da guilda (sem dependências de servidor: serve em página e em componente do navegador). */
export function GuildTag({ guild }: { guild: string | null | undefined }) {
  if (!guild) return null;
  return (
    <span className="tag tag-ice whitespace-nowrap" title={`Guilda ${guild}`}>
      🛡️ {guild}
    </span>
  );
}
