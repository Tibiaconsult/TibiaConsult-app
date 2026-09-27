import Link from "next/link";

// Um degrau do pódio do "Hoje no Tibia": sprite animado em cima, lugar, rótulo e nome na frente do bloco.

export default function PodiumStep({
  place,
  label,
  name,
  sub,
  img,
  href,
  height,
}: {
  place: string;
  label: string;
  name: string;
  sub?: string;
  img: string;
  href?: string;
  height: number;
}) {
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt={name} className="tc-podium-sprite" width={64} height={64} />
      <div className="tc-podium-block" style={{ height }}>
        <span className="tc-podium-place">{place}</span>
        <span className="tc-podium-label">{label}</span>
        <b className="tc-podium-name">{name}</b>
      </div>
    </>
  );
  return href ? (
    <Link href={href} className="tc-podium-step" title={`${label}: ${name}${sub ? ` (${sub})` : ""}`}>
      {body}
    </Link>
  ) : (
    <div className="tc-podium-step" title={`${label}: ${name}${sub ? ` (${sub})` : ""}`}>
      {body}
    </div>
  );
}
