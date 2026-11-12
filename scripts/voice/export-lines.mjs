// Mencetak naskah Mochi (content/script.ts) sebagai JSON, supaya skrip
// Python pembuat suara memakai teks yang persis sama dengan situs.
// Cara kerja: content/site.ts dan content/script.ts diterjemahkan dari
// TypeScript ke JavaScript dengan compiler TypeScript milik proyek, ditulis
// ke folder sementara, lalu diimpor.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..", "..");
const out = mkdtempSync(join(tmpdir(), "mochi-script-"));

try {
  for (const name of ["site", "script"]) {
    const source = readFileSync(join(root, "content", `${name}.ts`), "utf8");
    let js = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    // impor antar-file perlu ekstensi .mjs saat dijalankan langsung oleh Node
    js = js.replace(/from "\.\/(\w+)"/g, 'from "./$1.mjs"');
    writeFileSync(join(out, `${name}.mjs`), js);
  }
  const { SCRIPT } = await import(pathToFileURL(join(out, "script.mjs")).href);
  process.stdout.write(JSON.stringify(SCRIPT));
} finally {
  rmSync(out, { recursive: true, force: true });
}
