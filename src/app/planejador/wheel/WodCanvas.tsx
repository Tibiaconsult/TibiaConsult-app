"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Roda desenhada como no planner do tibia.com: mesmas imagens (static.tibia.com), mesma geometria,
// mesmas cores somadas ("lighter"). Acrescenta só a animação suave de preenchimento.
import { useEffect, useRef, useState } from "react";
import { WOD_SLICES, WodVoc } from "@/lib/wod-engine";

const IMG = "https://static.tibia.com/images/community/wheelofdestiny/";
const IMG_G = "https://static.tibia.com/images/global/common/skillwheel/";
const FILES = {
  backdrop: IMG + "backdrop_skillwheel.png",
  socketOff: IMG + "backdrop_skillwheel_largebonus_socketdisabled.png",
  socketOn: IMG + "backdrop_skillwheel_largebonus_socketenabled.png",
  light: IMG + "backdrop_skillwheel_largebonus_light.png",
  Knight: IMG + "backdrop_skillwheel_front_knight.png",
  Druid: IMG + "backdrop_skillwheel_front_druid.png",
  Sorcerer: IMG + "backdrop_skillwheel_front_sorc.png",
  Paladin: IMG + "backdrop_skillwheel_front_paladin.png",
  Monk: IMG + "backdrop_skillwheel_front_monk.png",
  front0: IMG + "backdrop_skillwheel_largebonus_front0.png",
  front1: IMG + "backdrop_skillwheel_largebonus_front1.png",
  front2: IMG + "backdrop_skillwheel_largebonus_front2.png",
  front3: IMG + "backdrop_skillwheel_largebonus_front3.png",
  large: IMG + "icons-skillwheel-largeperks.png",
  markerLarge: IMG + "marker_largeperk.png",
  gems: IMG_G + "icons-gematelier-gemvariants.png",
  sockets: IMG + "icons-skillwheel-sockets.png",
  basicMods: IMG_G + "icons-skillwheel-basicmods.png",
  supremeMods: IMG_G + "icons-skillwheel-suprememods.png",
  markerSocket: IMG + "marker-skillwheelsocket.png",
  medium: IMG + "icons-skillwheel-mediumperks.png",
  small: IMG + "icons-skillwheel-smallperks.png",
  vrBasic: IMG + "icon_skillwheel_vesselresonance_basic.png",
  vrSupreme: IMG + "icon_skillwheel_vesselresonance_supreme.png",
} as const;
type Imgs = Record<keyof typeof FILES, HTMLImageElement>;

let imgPromise: Promise<Imgs> | null = null;
function loadImages(): Promise<Imgs> {
  if (imgPromise) return imgPromise;
  imgPromise = Promise.all(
    Object.entries(FILES).map(
      ([k, src]) =>
        new Promise<[string, HTMLImageElement]>((res, rej) => {
          const i = new Image();
          i.referrerPolicy = "no-referrer";
          i.onload = () => res([k, i]);
          i.onerror = () => rej(new Error(src));
          i.src = src;
        }),
    ),
  ).then((list) => Object.fromEntries(list) as Imgs);
  imgPromise.catch(() => (imgPromise = null));
  return imgPromise;
}

export type Q = "TL" | "TR" | "BL" | "BR";
export type Pick = { kind: "slice"; id: string } | { kind: "vessel"; q: Q } | { kind: "socket"; q: Q } | null;

const QS: Q[] = ["TL", "TR", "BL", "BR"];
const P = 261;
const TN = 50;
const GAP = 2;
const U = Math.PI / 180;
const WEAK: Record<Q, string> = { TL: "#46b21c31", TR: "#ae143431", BL: "#198d4031", BR: "#841d9e31" };
const STRONG: Record<Q, string> = { TL: "#94c4126b", TR: "#ef1a386b", BL: "#18cd8f6b", BR: "#e618da6b" };
const HOVER = "#80808067";
const VR_CATEGORY = 4;

const inner = (r: number) => r * (TN + GAP) + 1;
const outer = (r: number) => inner(r) + TN;

/** Geometria dos vessels (a pedra grande em cada canto), igual ao planner oficial. */
const VESSEL: Record<Q, { j: number; rot: number; flip: boolean; N: number; J: number; ee: number; ne: number }> = (() => {
  const base: Record<Q, [number, number]> = { TL: [180, 0], TR: [270, 90], BL: [90, 270], BR: [0, 180] };
  const out = {} as any;
  for (const q of QS) {
    const [j, rot] = base[q];
    const oe = q === "TR" || q === "BL" ? 34 : 56;
    out[q] = {
      j,
      rot,
      flip: q === "TR" || q === "BL",
      N: Math.round(Math.cos((j + 45) * U) * 311) + P,
      J: Math.round(Math.sin((j + 45) * U) * 311) + P,
      ee: Math.round(Math.cos((j + oe) * U) * 287) + P,
      ne: Math.round(Math.sin((j + oe) * U) * 287) + P,
    };
  }
  return out;
})();

/** Qual fatia, vessel ou encaixe de gema está sob o ponto (coordenadas do canvas 522x522). */
export function hitTest(x: number, y: number): Pick {
  const dx = x - P;
  const dy = y - P;
  const r = Math.sqrt(dx * dx + dy * dy);
  let a = Math.atan(dy / dx) / U;
  if (dx < 0) a += 180;
  else if (dx > 0 && dy < 0) a += 360;
  for (const s of WOD_SLICES) {
    if (inner(s.ring) - GAP / 2 <= r && r <= outer(s.ring) + GAP / 2 && s.a0 <= a && a < s.a1) return { kind: "slice", id: s.id };
  }
  for (const q of QS) {
    const v = VESSEL[q];
    if (Math.hypot(v.N - x, v.J - y) <= 25) return { kind: "vessel", q };
  }
  for (const q of QS) {
    const v = VESSEL[q];
    if (Math.hypot(v.ee - x, v.ne - y) <= 17) return { kind: "socket", q };
  }
  return null;
}

export interface WodSlice {
  fillPercent: number;
  unlocked: boolean;
  mediumPerkId: number;
  smallPerkId: number;
  mediumPerkCategory: number;
}
export interface WodCorner {
  id: number;
  largePerkId: number;
  level: number;
  fillPercent: number;
  vesselLevel: number;
  hasGem: boolean;
  gemQuality: number;
  socketBezelImgId: number;
  gemImgId: number;
  keyBasicMod1: number;
  keyBasicMod2: number;
  keySupremeMod: number;
}

interface Props {
  voc: WodVoc;
  slices: Record<string, WodSlice>;
  corners: WodCorner[];
  selected: Pick;
  onSelect: (p: Pick) => void;
  onHover: (p: Pick) => void;
  /** Botão direito (ou toque longo) numa fatia: n = pontos pelas teclas (0 = encher ou esvaziar). */
  onRightClick: (id: string, n: number) => void;
}

const same = (a: Pick, b: Pick) => JSON.stringify(a) === JSON.stringify(b);

export default function WodCanvas({ voc, slices, corners, selected, onSelect, onHover, onRightClick }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [imgs, setImgs] = useState<Imgs | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<Pick>(null);
  // valores mostrados (animados) de preenchimento das fatias e dos vessels
  const shown = useRef<Record<string, number>>({});
  const frame = useRef(0);
  const touch = useRef<{ t: number; x: number; y: number } | null>(null);
  const lastCtx = useRef(0);

  useEffect(() => {
    loadImages().then(setImgs, () => setFailed(true));
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    if (!imgs || !cv) return;
    const h = cv.getContext("2d");
    if (!h) return;

    const target: Record<string, number> = {};
    for (const s of WOD_SLICES) target[s.id] = slices[s.id]?.fillPercent ?? 0;
    for (const c of corners) target["V" + QS[c.id]] = c.fillPercent;
    if (!Object.keys(shown.current).length) shown.current = { ...target };

    const fillA = (color: string) => {
      h.fillStyle = color;
      h.globalCompositeOperation = "lighter";
      h.fill("evenodd");
    };
    const ring = (r0: number, r1: number, a0: number, a1: number) => {
      h.beginPath();
      h.arc(P, P, r0, a0, a1, false);
      h.arc(P, P, r1, a1, a0, true);
      h.closePath();
    };
    const pie = (f: number, v: { N: number; J: number }) => {
      h.beginPath();
      if (f !== 1) h.moveTo(v.N, v.J);
      h.arc(v.N, v.J, 25, -90 * U, (360 * f - 90) * U, false);
      h.closePath();
    };
    const rotate = (deg: number) => {
      h.translate(P, P);
      h.rotate(deg * U);
      h.translate(-P, -P);
    };
    const mirror = (im: HTMLImageElement) => {
      h.translate(im.height / 2, im.width / 2);
      h.rotate(-90 * U);
      h.scale(-1, 1);
      h.translate(-im.width / 2, -im.height / 2);
    };

    const draw = () => {
      const f = shown.current;
      h.clearRect(0, 0, 522, 522);
      h.drawImage(imgs.backdrop, 0, 0);

      // fatias: cor fraca quando liberada, cor forte até onde há pontos
      h.save();
      for (const s of WOD_SLICES) {
        const d = slices[s.id];
        const pct = f[s.id] ?? 0;
        const a0 = s.a0 * U;
        const a1 = s.a1 * U;
        const r0 = inner(s.ring);
        const r1 = outer(s.ring);
        let rf = r0 + pct * (r1 - r0);
        rf = pct < 0.5 ? Math.ceil(rf) : Math.floor(rf);
        if (pct > 0.001) {
          ring(r0, rf, a0, a1);
          fillA(STRONG[s.q]);
        }
        if (d?.unlocked) {
          ring(r0, r1, a0, a1);
          fillA(WEAK[s.q]);
        }
      }
      h.restore();

      if (hover?.kind === "slice") {
        const s = WOD_SLICES.find((g) => g.id === hover.id)!;
        h.save();
        ring(inner(s.ring), outer(s.ring), s.a0 * U, s.a1 * U);
        fillA(HOVER);
        h.restore();
      }

      h.drawImage(imgs[voc], 0, 0);

      // ícones das fatias (conviction em cima, dedication pequeno embaixo)
      const me = imgs.medium.height;
      const se = imgs.small.height;
      const vrCount: Record<Q, number> = { TL: 0, TR: 0, BL: 0, BR: 0 };
      h.save();
      for (const s of WOD_SLICES) {
        const d = slices[s.id];
        if (!d) continue;
        const ang = ((s.a0 + s.a1) / 2) * U;
        let rad = (inner(s.ring) + outer(s.ring)) / 2;
        rad += rad < outer(0) ? 2 : 0;
        const x = Math.round(Math.cos(ang) * rad + P - me / 2);
        const y = Math.round(Math.sin(ang) * rad + P - me / 2);
        let gemIcon = false;
        if (d.mediumPerkCategory === VR_CATEGORY && d.fillPercent === 1) {
          const c = corners.find((k) => QS[k.id] === s.q);
          if (c && c.hasGem && c.gemQuality >= vrCount[s.q]) {
            gemIcon = true;
            vrCount[s.q]++;
            let key = c.keyBasicMod1;
            let icons = imgs.basicMods;
            let bezel = imgs.vrBasic;
            let dy = 0;
            if (vrCount[s.q] === 2) key = c.keyBasicMod2;
            if (vrCount[s.q] === 3) {
              key = c.keySupremeMod;
              icons = imgs.supremeMods;
              bezel = imgs.vrSupreme;
              dy = -5;
            }
            const o = icons.height;
            const b = bezel.height;
            h.drawImage(bezel, 0, 0, b, b, x - 1, y - 1, b, b);
            h.drawImage(icons, key * o, 0, o, o, x, y + dy, o, o);
          }
        }
        if (!gemIcon) h.drawImage(imgs.medium, d.mediumPerkId * me, 0, me, me, x, y, me, me);
        h.drawImage(imgs.small, d.smallPerkId * se, 0, se, se, x - 3, y + 17, se, se);
      }
      h.restore();

      // vessels nos quatro cantos
      for (const c of corners) {
        const q = QS[c.id];
        const v = VESSEL[q];
        const fill = f["V" + q] ?? c.fillPercent;
        const front = [imgs.front0, imgs.front1, imgs.front2, imgs.front3][Math.min(c.level, 3)];
        const socket = c.vesselLevel > 0 ? imgs.socketOn : imgs.socketOff;

        h.save();
        if (v.rot) rotate(v.rot);
        if (v.flip) mirror(socket);
        h.drawImage(socket, 0, 0);
        h.restore();

        h.save();
        pie(fill, v);
        fillA(STRONG[q]);
        pie(1, v);
        fillA(WEAK[q]);
        h.restore();

        h.save();
        h.beginPath();
        h.arc(P, P, 270, (v.j + 40) * U, (v.j + 50) * U, false);
        h.arc(P, P, 285, (v.j + 50) * U, (v.j + 40) * U, true);
        h.closePath();
        fillA(STRONG[q]);
        fillA(STRONG[q]);
        fillA(STRONG[q]);
        h.restore();

        if (hover?.kind === "vessel" && hover.q === q) {
          h.save();
          pie(1, v);
          fillA(HOVER);
          h.restore();
        }
        if (hover?.kind === "socket" && hover.q === q) {
          h.save();
          h.beginPath();
          h.arc(v.ee, v.ne, 17, 0, 2 * Math.PI, false);
          h.closePath();
          fillA(HOVER);
          h.restore();
        }

        h.save();
        if (v.rot) rotate(v.rot);
        h.globalAlpha = 0.4;
        h.drawImage(imgs.light, 0, 0);
        h.restore();

        h.save();
        if (v.rot) rotate(v.rot);
        if (v.flip) mirror(front);
        h.drawImage(front, 0, 0);
        h.restore();

        const l = imgs.large.height;
        h.drawImage(imgs.large, c.largePerkId * l, 0, l, l, v.N - l / 2, v.J - l / 2, l, l);

        if (selected?.kind === "vessel" && selected.q === q) h.drawImage(imgs.markerLarge, Math.round(v.N - 25 + 1), Math.round(v.J - 25 + 1));

        if (c.hasGem) {
          const g = imgs.gems.height;
          h.drawImage(imgs.gems, c.gemImgId * g, 0, g, g, v.ee - g / 2, v.ne - g / 2, g, g);
        }
        const b = imgs.sockets.height;
        h.drawImage(imgs.sockets, c.socketBezelImgId * b, 0, b, b, v.ee - b / 2, v.ne - b / 2, b, b);

        if (selected?.kind === "socket" && selected.q === q) {
          const dy = q === "TL" || q === "TR" ? -2 : 0;
          h.drawImage(imgs.markerSocket, Math.round(v.ee - 17 - 1), Math.round(v.ne - 17 + dy));
        }
      }

      // contorno branco da fatia selecionada
      if (selected?.kind === "slice") {
        const s = WOD_SLICES.find((g) => g.id === selected.id);
        if (s) {
          h.save();
          ring(inner(s.ring) - GAP / 2, outer(s.ring) + GAP / 2, s.a0 * U, s.a1 * U);
          h.lineWidth = GAP;
          h.strokeStyle = "white";
          h.stroke();
          h.restore();
        }
      }
    };

    // animação: aproxima o preenchimento mostrado do valor real a cada quadro
    const step = () => {
      let moving = false;
      for (const k of Object.keys(target)) {
        const cur = shown.current[k] ?? target[k];
        const diff = target[k] - cur;
        if (Math.abs(diff) < 0.004) shown.current[k] = target[k];
        else {
          shown.current[k] = cur + diff * 0.22;
          moving = true;
        }
      }
      draw();
      if (moving) frame.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(frame.current);
    step();
    return () => cancelAnimationFrame(frame.current);
  }, [imgs, voc, slices, corners, selected, hover]);

  const pos = (clientX: number, clientY: number) => {
    const r = canvas.current!.getBoundingClientRect();
    const k = 522 / r.width;
    return hitTest((clientX - r.left) * k, (clientY - r.top) * k);
  };
  const keysToPoints = (e: { shiftKey: boolean; ctrlKey: boolean; altKey: boolean }) => {
    if (!e.altKey && !e.shiftKey && !e.ctrlKey) return 0;
    return (e.shiftKey ? 10 : 1) * (e.ctrlKey ? 100 : 1);
  };

  if (failed) return <p className="bad">Não foi possível carregar as imagens da roda do tibia.com. Tente recarregar a página.</p>;

  return (
    <div className="relative w-full max-w-[522px] mx-auto aspect-square">
      {!imgs && <div className="absolute inset-0 grid place-items-center text-[12px] muted">Carregando a roda...</div>}
      <canvas
        ref={canvas}
        width={522}
        height={522}
        className="w-full h-full select-none cursor-pointer"
        style={{ touchAction: "manipulation" }}
        onMouseMove={(e) => {
          const p = pos(e.clientX, e.clientY);
          if (!same(p, hover)) {
            setHover(p);
            onHover(p);
          }
        }}
        onMouseLeave={() => {
          setHover(null);
          onHover(null);
        }}
        onClick={(e) => {
          const p = pos(e.clientX, e.clientY);
          if (p) onSelect(p);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          lastCtx.current = Date.now();
          const p = pos(e.clientX, e.clientY);
          if (!p) return;
          onSelect(p);
          if (p.kind === "slice") onRightClick(p.id, keysToPoints(e));
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 1) touch.current = { t: Date.now(), x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchMove={() => (touch.current = null)}
        onTouchEnd={() => {
          const t = touch.current;
          touch.current = null;
          // toque longo = botão direito (no Android o navegador já manda o contextmenu)
          if (!t || Date.now() - t.t < 500 || Date.now() - lastCtx.current < 1500) return;
          const p = pos(t.x, t.y);
          if (p?.kind === "slice") onRightClick(p.id, 0);
        }}
      />
    </div>
  );
}
