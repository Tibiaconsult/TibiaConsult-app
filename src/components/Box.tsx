import type { ReactNode } from "react";

/** Caixa no estilo tibia.com: barra de título verde e corpo de pergaminho. */
export default function Box({ title, children, className = "", id }: { title: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`tc-panel scroll-mt-24 ${className}`}>
      <div className="tc-title">{title}</div>
      <div className="tc-box">{children}</div>
    </section>
  );
}
