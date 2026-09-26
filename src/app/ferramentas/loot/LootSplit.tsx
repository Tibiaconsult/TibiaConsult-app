"use client";

import { useMemo, useState } from "react";
import { SAMPLE, parseSession, split } from "@/lib/lootsplit";

const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");

export default function LootSplit() {
  const [text, setText] = useState("");
  const [expenses, setExpenses] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const session = useMemo(() => parseSession(text), [text]);
  const result = useMemo(
    () => split(session, Object.fromEntries(Object.entries(expenses).map(([k, v]) => [k, Number(v.replace(/\D/g, "")) || 0])), removed),
    [session, expenses, removed],
  );

  const copy = async (s: string) => {
    try {
      await navigator.clipboard.writeText(s);
      setCopied(s);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      window.prompt("Copie:", s);
    }
  };

  // destaques da party: quem deu mais dano e quem mais gastou supplies
  const top = (k: "damage" | "supplies") => session.members.reduce<(typeof session.members)[number] | null>((best, m) => (m[k] > 0 && (!best || m[k] > best[k]) ? m : best), null);
  const king = top("damage");
  const spender = top("supplies");

  const allCommands = result.transfers.map((t) => `${t.from}: transfer ${t.amount} to ${t.to}`).join("\n");

  return (
    <div className="space-y-4">
      <ol className="list-decimal pl-5 text-[12px]">
        <li>No cliente do Tibia, abra o Party Hunt Analyser e clique em &quot;Copy to Clipboard&quot;.</li>
        <li>Cole abaixo. A divisão aparece na hora.</li>
        <li>Cada jogador que deve pagar fala ao NPC do banco o comando que aparece ao lado do nome dele.</li>
      </ol>
      <textarea className="w-full font-mono text-[11px]" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole aqui o texto do Party Hunt Analyser" />
      <div className="flex gap-2">
        <button type="button" className="tc-btn" onClick={() => setText(SAMPLE)}>
          Usar exemplo
        </button>
        <button type="button" className="tc-btn tc-btn-danger" onClick={() => (setText(""), setExpenses({}), setRemoved(new Set()))}>
          Limpar
        </button>
      </div>

      {session.members.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Saldo total do grupo", fmt(result.total)],
              ["Lucro por jogador", fmt(result.share)],
              ["Por jogador, por hora", result.perHour !== null ? fmt(result.perHour) : "-"],
              ["Sessão", `${session.duration ?? "-"} · ${session.lootType ?? "-"}`],
            ].map(([l, v]) => (
              <div key={l} className="border border-[#b98a5a] rounded p-3 bg-white/40">
                <div className="muted text-[11px]">{l}</div>
                <div className={`font-bold text-[16px] ${l === "Lucro por jogador" ? (result.share >= 0 ? "good" : "bad") : "text-[#3a1a00]"}`}>{v}</div>
              </div>
            ))}
          </div>

          {(king || spender) && (
            <div className="flex flex-wrap gap-3 text-[12px]">
              {king && (
                <div className="border border-[#c9a13a] rounded px-3 py-2 bg-[#fff4cf]">
                  <span className="tc-crown text-[18px] mr-1" aria-hidden>
                    👑
                  </span>
                  <b>Rei do dano:</b> {king.name} com {fmt(king.damage)}
                </div>
              )}
              {spender && (
                <div className="border border-[#3f8a3a] rounded px-3 py-2 bg-[#e9f6df]">
                  <span className="tc-spender text-[18px] mr-1" aria-hidden>
                    💸
                  </span>
                  <b>Gastador da hunt:</b> {spender.name} com {fmt(spender.supplies)} em supplies
                </div>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Jogador</th>
                  <th>Loot</th>
                  <th>Supplies</th>
                  <th>Balance</th>
                  <th>Despesa extra</th>
                  <th>Dano</th>
                  <th>Cura</th>
                  <th>Na divisão</th>
                </tr>
              </thead>
              <tbody>
                {session.members.map((m) => {
                  const r = result.rows.find((x) => x.name === m.name);
                  const out = removed.has(m.name);
                  return (
                    <tr key={m.name} style={out ? { opacity: 0.5 } : undefined}>
                      <td className="font-bold whitespace-nowrap">
                        {m.name}
                        {king?.name === m.name && (
                          <span className="tc-crown ml-1" title="Quem deu mais dano">
                            👑
                          </span>
                        )}
                        {spender?.name === m.name && (
                          <span className="tc-spender ml-1" title="Quem mais gastou em supplies">
                            💸
                          </span>
                        )}{" "}
                        {m.leader && <span className="muted text-[10px]">(leader)</span>}
                      </td>
                      <td>{fmt(m.loot)}</td>
                      <td className={spender?.name === m.name ? "font-bold" : ""}>{fmt(m.supplies)}</td>
                      <td className={m.balance >= 0 ? "good" : "bad"}>{fmt(m.balance)}</td>
                      <td>
                        <input className="w-28" value={expenses[m.name] ?? ""} placeholder="0" onChange={(e) => setExpenses({ ...expenses, [m.name]: e.target.value })} disabled={out} />
                      </td>
                      <td className={king?.name === m.name ? "font-bold" : ""}>{fmt(m.damage)}</td>
                      <td>{fmt(m.healing)}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={!out}
                          onChange={() => {
                            const s = new Set(removed);
                            if (s.has(m.name)) s.delete(m.name);
                            else s.add(m.name);
                            setRemoved(s);
                          }}
                        />
                        {r && !out && <span className={`ml-2 text-[11px] ${r.diff > 0 ? "warn" : "good"}`}>{r.diff > 0 ? `paga ${fmt(r.diff)}` : r.diff < 0 ? `recebe ${fmt(-r.diff)}` : "zerado"}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="muted text-[11px]">Despesa extra: gasto que o jogador teve fora do analyser (imbuement, prey, runa comprada antes). Ela é reembolsada na divisão.</p>

          <h2>Transferências</h2>
          {result.transfers.length === 0 ? (
            <p>Ninguém precisa transferir nada.</p>
          ) : (
            <div className="space-y-2">
              {result.transfers.map((t, i) => {
                const cmd = `transfer ${t.amount} to ${t.to}`;
                return (
                  <div key={i} className="flex flex-wrap items-center gap-3 border border-[#b98a5a] rounded p-2 bg-white/40">
                    <span className="font-bold">{t.from}</span>
                    <span>paga {fmt(t.amount)} para</span>
                    <span className="font-bold">{t.to}</span>
                    <code className="bg-white/70 px-2 py-0.5 rounded text-[11px]">{cmd}</code>
                    <button type="button" className="tc-btn !py-0.5" onClick={() => copy(cmd)}>
                      {copied === cmd ? "copiado" : "copiar"}
                    </button>
                  </div>
                );
              })}
              <button type="button" className="tc-btn" onClick={() => copy(allCommands)}>
                {copied === allCommands ? "copiado" : "Copiar todas as transferências"}
              </button>
            </div>
          )}
        </>
      )}
      {text && session.members.length === 0 && <p className="bad">Não reconheci jogadores no texto. Confira se colou o conteúdo do Party Hunt Analyser.</p>}
    </div>
  );
}
