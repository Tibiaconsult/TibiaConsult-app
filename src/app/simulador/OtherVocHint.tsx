"use client";

import Link from "next/link";
import { VOC_LABEL, useActive } from "@/lib/active";

/** Quem está com outra vocação ativa é levado ao simulador dela. */
export default function OtherVocHint() {
  const { voc } = useActive();
  if (!voc || voc === "sorcerer") return null;
  return (
    <p className="warn text-[12px] mb-3 border border-[#c9a13a] bg-[#fff4cf] rounded p-2">
      Este simulador é do Master Sorcerer.{" "}
      {voc === "monk" ? (
        <>O Exalted Monk ainda não tem simulador: a fórmula das magias dele não é pública.</>
      ) : (
        <>
          O de {VOC_LABEL[voc]} fica na página da vocação:{" "}
          <Link href={`/vocacoes/${voc}#simulador`} className="font-bold">
            abrir o simulador de {VOC_LABEL[voc]}
          </Link>
          .
        </>
      )}
    </p>
  );
}
