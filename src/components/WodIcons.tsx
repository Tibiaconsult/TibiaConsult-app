// Ícones oficiais do planner da Wheel (folhas de sprite de static.tibia.com), recortados pelo índice do mod ou da revelation.

const IMG = "https://static.tibia.com/images/community/wheelofdestiny/";
const IMG_G = "https://static.tibia.com/images/global/common/skillwheel/";
const SHEETS = {
  basic: { src: IMG_G + "icons-skillwheel-basicmods.png", h: 30, n: 49 },
  supreme: { src: IMG_G + "icons-skillwheel-suprememods.png", h: 35, n: 94 },
  large: { src: IMG + "icons-skillwheel-largeperks.png", h: 34, n: 16 },
};

export function WodIcon({ sheet, index, size, title }: { sheet: keyof typeof SHEETS; index: number; size?: number; title?: string }) {
  const s = SHEETS[sheet];
  const px = size ?? s.h;
  const k = px / s.h;
  return (
    <span
      role="img"
      aria-label={title ?? ""}
      title={title}
      className="inline-block align-middle shrink-0"
      style={{
        width: px,
        height: px,
        backgroundImage: `url(${s.src})`,
        backgroundPosition: `-${index * px}px 0`,
        backgroundSize: `${s.n * s.h * k}px ${px}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}
