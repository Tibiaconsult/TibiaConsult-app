"use client";

import { useEffect, useState } from "react";
import Box from "@/components/Box";
import SetCalculator from "./SetCalculator";
import VocSetBuilder from "./VocSetBuilder";

/** Sorcerer usa o montador completo (forja, comparação e simulador); as outras vocações, o montador por slot. */
export default function SetTabs() {
  const [tab, setTab] = useState<"sorcerer" | "outras">("sorcerer");
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("v")) setTab("outras");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <button type="button" className={`tc-btn ${tab === "sorcerer" ? "" : "opacity-60"}`} onClick={() => setTab("sorcerer")}>
          Master Sorcerer
        </button>
        <button type="button" className={`tc-btn ${tab === "outras" ? "" : "opacity-60"}`} onClick={() => setTab("outras")}>
          Druid, Knight, Paladin e Monk
        </button>
      </div>
      {tab === "sorcerer" ? (
        <Box title="Seu inventário (sorcerer)">
          <SetCalculator />
        </Box>
      ) : (
        <Box title="Seu inventário">
          <VocSetBuilder />
        </Box>
      )}
    </div>
  );
}
