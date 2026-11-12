/*
 * Skrip kecil yang dijalankan browser saat membaca HTML, sebelum halaman
 * pertama kali digambar. Dipakai untuk hal yang harus benar sejak awal,
 * misalnya "intro sudah dilihat di sesi ini" (tanpa kedipan).
 *
 * Di browser tipenya diubah jadi text/plain supaya React tidak menjalankan
 * ulang skripnya dan tidak memberi peringatan; suppressHydrationWarning
 * menerima perbedaan tipe itu.
 * Pola dari node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
