"use client";

// Impor bernama dari satu shader saja. Dipisah ke file sendiri supaya bundler
// bisa membuang shader lain dari paket @paper-design/shaders-react (paket itu
// ditandai bebas efek samping). Mengimpor seluruh modul secara dinamis
// (import("@paper-design/shaders-react")) ikut memuat semua shader.
import { LiquidMetal } from "@paper-design/shaders-react";

export default LiquidMetal;
