// XP por dia dos últimos 14 dias: barras finas com o valor no hover (title) e o maior dia escrito.
import { shortXp } from "./party";

export default function XpBars({ days }: { days: { d: string; xp: number }[] }) {
  if (days.length < 2) return <p className="muted text-[11px]">Poucos dias coletados ainda para o gráfico.</p>;
  const W = 280;
  const H = 64;
  const max = Math.max(...days.map((x) => x.xp), 1);
  const bw = W / days.length;
  const best = days.reduce((a, b) => (b.xp > a.xp ? b : a));
  const dm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" role="img" aria-label="XP por dia nos últimos 14 dias" className="block max-w-[360px]">
        <line x1={0} x2={W} y1={H} y2={H} stroke="#b98a5a" strokeWidth={1} opacity={0.6} />
        {days.map((x, i) => {
          const h = x.xp ? Math.max(2, (x.xp / max) * (H - 4)) : 0;
          return (
            <g key={x.d}>
              {/* área de hover maior que a barra */}
              <rect x={i * bw} y={0} width={bw} height={H} fill="transparent">
                <title>{`${dm(x.d)}: ${x.xp ? shortXp(x.xp) + " de XP" : "sem XP"}`}</title>
              </rect>
              {h > 0 && <rect x={i * bw + 2} y={H - h} width={Math.max(2, bw - 4)} height={h} rx={2} fill="#a8611f" pointerEvents="none" />}
            </g>
          );
        })}
        <text x={0} y={H + 11} fontSize={9} fill="#6b4a2b">
          {dm(days[0].d)}
        </text>
        <text x={W} y={H + 11} fontSize={9} fill="#6b4a2b" textAnchor="end">
          {dm(days[days.length - 1].d)}
        </text>
      </svg>
      <figcaption className="muted text-[10px]">
        XP por dia (14 dias). Melhor dia: {dm(best.d)}, {shortXp(best.xp)}.
      </figcaption>
    </figure>
  );
}
