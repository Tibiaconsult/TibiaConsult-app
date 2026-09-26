import { itemIcon, spellIcon } from "@/lib/icons";

export function SpellIcon({ id, size = 22 }: { id: string; size?: number }) {
  const src = spellIcon(id);
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className="inline-block align-middle mr-1" />;
}

export function ItemSprite({ name, size = 32 }: { name: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={itemIcon(name)} alt="" width={size} height={size} className="sprite inline-block align-middle mr-1" />;
}
