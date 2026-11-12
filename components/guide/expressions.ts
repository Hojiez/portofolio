// Daftar ekspresi Mochi. Dipisah dari Mascot.tsx (komponen client) supaya
// bisa dipakai juga di komponen server dan di content/script.ts nanti.
export const EXPRESSIONS = ["idle", "talk", "happy", "smug", "curious", "sleep", "smirk"] as const;

export type MascotExpression = (typeof EXPRESSIONS)[number];
