"use client";

// Vocação e char ativos: escolhidos uma vez (na barra do topo ou em qualquer seletor de vocação) e usados por todas as páginas.
// Ficam só no navegador de quem usa (localStorage); o char guardado é uma cópia dos dados do próprio usuário.

import { useSyncExternalStore } from "react";

export type Voc = "sorcerer" | "druid" | "knight" | "paladin" | "monk";
export const VOCS: Voc[] = ["sorcerer", "druid", "knight", "paladin", "monk"];

export interface ActiveChar {
  id: string;
  name: string;
  vocation: Voc;
  level: number;
  magic_level: number;
  skill: number | null;
  world: string | null;
}

interface ActiveState {
  voc: Voc | null;
  char: ActiveChar | null;
}

const KEY_VOC = "tc-voc";
const KEY_CHAR = "tc-char";
const EVENT = "tc-active";
const EMPTY: ActiveState = { voc: null, char: null };

let cache: ActiveState | null = null;
let cacheRaw = "";

function read(): ActiveState {
  try {
    const rawVoc = localStorage.getItem(KEY_VOC) ?? "";
    const rawChar = localStorage.getItem(KEY_CHAR) ?? "";
    const raw = rawVoc + "|" + rawChar;
    if (cache && raw === cacheRaw) return cache;
    const voc = VOCS.includes(rawVoc as Voc) ? (rawVoc as Voc) : null;
    let char: ActiveChar | null = null;
    if (rawChar) {
      const c = JSON.parse(rawChar);
      if (c && typeof c.id === "string" && VOCS.includes(c.vocation)) char = c;
    }
    cacheRaw = raw;
    cache = { voc, char };
    return cache;
  } catch {
    return EMPTY;
  }
}

function subscribe(cb: () => void) {
  const h = () => cb();
  window.addEventListener(EVENT, h);
  window.addEventListener("storage", h);
  return () => {
    window.removeEventListener(EVENT, h);
    window.removeEventListener("storage", h);
  };
}

export function useActive(): ActiveState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function getActive(): ActiveState {
  return typeof window === "undefined" ? EMPTY : read();
}

/** Cookie com a vocação ativa, para as páginas do servidor já abrirem nela (sem piscar). */
function writeCookie(v: Voc) {
  document.cookie = `${KEY_VOC}=${v}; path=/; max-age=31536000; samesite=lax`;
}

export function setActiveVoc(v: Voc) {
  writeCookie(v);
  try {
    localStorage.setItem(KEY_VOC, v);
    // trocar a vocação na mão solta o char ativo de outra vocação
    const c = read().char;
    if (c && c.vocation !== v) localStorage.removeItem(KEY_CHAR);
  } catch {
    // navegador sem armazenamento: vale só nesta página
  }
  window.dispatchEvent(new Event(EVENT));
}

export function setActiveChar(c: ActiveChar | null) {
  try {
    if (c) {
      writeCookie(c.vocation);
      localStorage.setItem(KEY_CHAR, JSON.stringify(c));
      localStorage.setItem(KEY_VOC, c.vocation);
    } else localStorage.removeItem(KEY_CHAR);
  } catch {
    // sem armazenamento
  }
  window.dispatchEvent(new Event(EVENT));
}

export const VOC_LABEL: Record<Voc, string> = {
  sorcerer: "Master Sorcerer",
  druid: "Elder Druid",
  knight: "Elite Knight",
  paladin: "Royal Paladin",
  monk: "Exalted Monk",
};
export const VOC_SHORT: Record<Voc, string> = { sorcerer: "Sorcerer", druid: "Druid", knight: "Knight", paladin: "Paladin", monk: "Monk" };
export const VOC_OUTFIT_FILE: Record<Voc, string> = {
  sorcerer: "Outfit Mage Male Addon 3",
  druid: "Outfit Druid Male Addon 3",
  knight: "Outfit Knight Male Addon 3",
  paladin: "Outfit Hunter Male Addon 3",
  monk: "Outfit Monk Male Addon 3",
};
