import type { ReactNode } from "react";

/** Caixa no estilo tibia.com: barra de título verde e corpo de pergaminho. */
export default function Box({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`tc-panel ${className}`}>
      <div className="tc-title">{title}</div>
      <div className="tc-box">{children}</div>
    </section>
  );
}
