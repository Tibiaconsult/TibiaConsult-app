"use client";

import { useState, type InputHTMLAttributes } from "react";

// Campo numérico que deixa digitar à vontade: enquanto você digita, o texto fica como está e o valor só é repassado quando
// já é válido (dentro de min e max); ao sair do campo ou apertar Enter, o que estiver fora da faixa é corrigido.
// Evita o campo "pular" para o mínimo no primeiro dígito (ex.: digitar 1000 num level com mínimo 8).

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "min" | "max"> & {
  value: number;
  onValue: (v: number) => void;
  min?: number;
  max?: number;
};

export default function NumberInput({ value, onValue, min, max, onBlur, onKeyDown, ...rest }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const parse = (s: string) => Number(s.replace(",", "."));

  const commit = (s: string) => {
    const n = parse(s);
    const next = s.trim() === "" || !Number.isFinite(n) ? value : clamp(n);
    if (next !== value) onValue(next);
    setDraft(null);
  };

  return (
    <input
      {...rest}
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      value={draft ?? String(value)}
      onChange={(e) => {
        const s = e.target.value;
        setDraft(s);
        const n = parse(s);
        if (s.trim() !== "" && Number.isFinite(n) && n === clamp(n)) onValue(n);
      }}
      onBlur={(e) => {
        commit(e.target.value);
        onBlur?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit(e.currentTarget.value);
        onKeyDown?.(e);
      }}
    />
  );
}
