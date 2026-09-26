"use client";

import { useState } from "react";
import FeedbackForm from "./FeedbackForm";

/** Botão flutuante em todas as páginas: bug, dado errado, sugestão de hunt ou de funcionalidade. */
export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="tc-feedback-fab" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Reportar ou sugerir
      </button>
      {open && (
        <div className="tc-modal" role="dialog" aria-modal="true" aria-label="Reportar ou sugerir" onClick={() => setOpen(false)}>
          <div className="tc-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="tc-title flex items-center justify-between">
              <span>Reportar ou sugerir</span>
              <button type="button" onClick={() => setOpen(false)} className="text-[#f6d372] text-[18px] leading-none" aria-label="Fechar">
                ×
              </button>
            </div>
            <div className="tc-box">
              <FeedbackForm compact />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
