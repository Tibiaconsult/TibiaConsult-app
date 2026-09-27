"use client";

import { useActionState, useState } from "react";
import { usePathname } from "next/navigation";
import { sendFeedback, FeedbackState } from "@/app/feedback/actions";

const KINDS = [
  { id: "bug", label: "Bug (algo quebrado)" },
  { id: "inconsistencia", label: "Dado errado ou inconsistente" },
  { id: "hunt", label: "Sugerir uma hunt" },
  { id: "funcionalidade", label: "Sugerir uma funcionalidade" },
  { id: "outro", label: "Outro assunto" },
];

const HINT: Record<string, string> = {
  bug: "O que você fez, o que esperava e o que aconteceu. Se tiver, diga o navegador e o aparelho.",
  inconsistencia: "Qual número ou texto está errado, onde está e qual é o certo. Se puder, mande o link da fonte (TibiaWiki, tibia.com).",
  hunt: "Por que essa hunt vale a pena e para qual vocação. Os campos abaixo ajudam a cadastrar mais rápido.",
  funcionalidade: "O que você quer fazer no site e como imagina que funcionaria.",
  outro: "Escreva à vontade.",
};

export default function FeedbackForm({ compact = false, initialKind = "bug" }: { compact?: boolean; initialKind?: string }) {
  const path = usePathname() ?? "/";
  const [kind, setKind] = useState(initialKind);
  const [state, action, pending] = useActionState<FeedbackState, FormData>(sendFeedback, { ok: false, message: "" });

  if (state.ok) return <p className="good">{state.message}</p>;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="page" value={path} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="block">
        Tipo
        <select name="kind" className="mt-1 w-full" value={kind} onChange={(e) => setKind(e.target.value)}>
          {KINDS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </label>
      {kind === "hunt" && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label>
            Nome da hunt
            <input name="hunt_name" className="mt-1 w-full" placeholder="ex.: Ingol -3" />
          </label>
          <label>
            Cidade ou acesso
            <input name="hunt_city" className="mt-1 w-full" placeholder="ex.: Ingol, quest X" />
          </label>
          <label>
            Level recomendado
            <input name="hunt_level" className="mt-1 w-full" placeholder="ex.: 700+" />
          </label>
          <label>
            Creatures principais
            <input name="hunt_creatures" className="mt-1 w-full" placeholder="separe por vírgula" />
          </label>
        </div>
      )}
      <label className="block">
        Mensagem
        <textarea name="message" rows={compact ? 4 : 6} required minLength={5} maxLength={4000} className="mt-1 w-full" placeholder={HINT[kind]} />
      </label>
      <label className="block">
        E-mail para resposta (opcional; se estiver logado, usamos o da conta)
        <input name="email" type="email" className="mt-1 w-full" />
      </label>
      <div className="flex items-center gap-3">
        <button className="tc-btn" disabled={pending}>
          {pending ? "Enviando..." : "Enviar"}
        </button>
        {state.message && <span className={state.ok ? "good" : "bad"}>{state.message}</span>}
      </div>
    </form>
  );
}
