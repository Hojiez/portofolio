import type { ElementType, ReactNode } from "react";

/*
 * Teks bergradien logam. Gradiennya diatur di .metal-text (app/globals.css).
 * Teks dibungkus <span> inline supaya gradien diulang di tiap baris, jadi
 * judul yang terpotong dua baris tetap terang di kedua barisnya.
 */
export function MetalText({
  as: Tag = "span",
  children,
  className = "",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag className={className}>
      <span className="metal-text">{children}</span>
    </Tag>
  );
}
