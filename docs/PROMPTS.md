# Prompt per Fase

Satu prompt untuk satu fase di `docs/MASTER_PLAN.md` bagian 9. Jalankan berurutan, satu fase per sesi, dan periksa hasilnya sebelum lanjut. Fase 3 boleh dikerjakan bersamaan dengan fase 1 atau 2.

Setiap prompt sudah berdiri sendiri: tempel apa adanya.

---

## Fase 0 — Fondasi

```
Baca docs/MASTER_PLAN.md (terutama bagian 8) dan AGENTS.md, lalu baca panduan
Next.js yang relevan di node_modules/next/dist/docs/ sebelum menulis kode.

Tugas: pecah app/page.tsx menjadi struktur folder di bagian 8 master plan.
- Pindahkan semua data pribadi (SITE, SOCIALS, ABOUT, PROJECTS, SKILLS,
  CATEGORIES) ke content/site.ts.
- Pindahkan tiap section ke components/sections/, dan Reveal, TiltCard, Icon
  ke components/ui/.
- Pindahkan pemuatan font ke app/layout.tsx.
- Jadikan "use client" hanya di komponen yang memang butuh state atau event.

Batasan: ini murni refactor. Tampilan dan perilaku halaman tidak boleh berubah
sama sekali. Jangan menambah library dan jangan mengubah warna atau teks.

Selesai jika: npm run build dan npm run lint lolos, dan halaman terlihat sama
persis seperti sebelumnya di desktop dan HP. Tunjukkan buktinya.
```

---

## Fase 1 — Visual dasar

```
Baca docs/MASTER_PLAN.md bagian 3, dan panduan Next.js/Tailwind yang relevan
di node_modules sebelum menulis kode.

Tugas: ganti tampilan dari "gelap dengan orb biru" menjadi "gelap metalik".
- Definisikan token warna bagian 3 di app/globals.css dan pakai token itu di
  semua komponen. Hapus semua warna biru elektrik (#2d7bff, #4d8dff, #1a3fff).
- Hapus tiga orb biru dan grid di latar.
- Buat components/ui/MetalText.tsx: teks dengan gradien logam (CSS saja),
  pakai untuk nama di hero dan judul section.
- Buat components/ui/MetalShader.tsx: satu elemen shader liquid metal di hero.
  Periksa dulu dokumentasi @paper-design/shaders-react untuk versi dan API
  terbarunya. Sediakan tampilan cadangan (gradien CSS) jika WebGL tidak ada
  atau pengunjung memakai prefers-reduced-motion.
- Ganti gaya kartu project: border tipis dengan kilau yang mengikuti kursor,
  bukan kaca biru.
- Biru es (--accent) hanya untuk aksen kecil: link, titik status, fokus.

Selesai jika: tidak ada sisa biru elektrik di kode, semua section memakai
palet baru, kontras teks tetap terbaca, dan npm run build lolos. Tunjukkan
tangkapan layar desktop dan HP.
```

---

## Fase 2 — Intro terminal

```
Baca docs/MASTER_PLAN.md bagian 4, dan panduan Next.js yang relevan di
node_modules sebelum menulis kode.

Tugas: buat components/intro/Terminal.tsx, layar pembuka berbentuk terminal.
- Isi dan urutan teks mengikuti bagian 4 persis, diketik otomatis dalam
  sekitar 4-5 detik. Ambil role, lokasi, dan jumlah project dari
  content/site.ts, jangan ditulis ulang.
- Enter di keyboard atau tombol "Enter" di layar menutup intro dengan
  transisi halus ke halaman.
- Tombol "Skip intro" selalu terlihat. Tombol Sound On/Off ada di intro
  (untuk sekarang cukup menyimpan pilihan ke localStorage; suaranya dibuat di
  fase 5).
- Intro tampil sekali per sesi (sessionStorage).
- prefers-reduced-motion: teks langsung tampil utuh.
- Isi halaman tetap dirender di belakang intro, dan scroll dikunci selama
  intro tampil.
- Fokus keyboard tidak boleh bisa masuk ke halaman di belakang intro.

Selesai jika: intro muncul di kunjungan pertama, tidak muncul lagi setelah
reload di sesi yang sama, bisa dilewati, dan berfungsi di HP tanpa keyboard.
```

---

## Fase 3 — Maskot

```
Baca docs/MASTER_PLAN.md bagian 5.

Tugas: buat components/guide/Mascot.tsx, maskot bernama Mochi.
- Wujud: blob oval dari logam cair mengilap seperti krom, dengan dua mata
  hitam bulat berkilau dan mulut kecil. (Sudah dikerjakan: awalnya husky-blob,
  lalu diganti ke blob logam.)
- Badan memakai MetalShader yang sama dengan hero; wajah berupa SVG inline.
  Jangan meniru karakter yang sudah ada.
- Props: expression ("idle" | "talk" | "happy" | "smug" | "curious" |
  "sleep") dan size.
- Animasi: bernapas dan berkedip saat idle, mulut bergerak saat talk,
  perpindahan antar ekspresi halus. Hormati prefers-reduced-motion.
- Buat halaman uji app/mascot/page.tsx yang menampilkan semua ekspresi
  berdampingan, dengan tombol untuk berpindah ekspresi.

Selesai jika: keenam ekspresi bisa dibedakan dengan jelas di ukuran 64px dan
160px, di atas latar gelap.
```

---

## Fase 4 — Sistem pemandu

```
Baca docs/MASTER_PLAN.md bagian 6, dan panduan Next.js yang relevan di
node_modules sebelum menulis kode.

(Sudah dikerjakan. Ringkasan cara kerjanya ada di docs/MASTER_PLAN.md bagian 6.)

Tugas: hubungkan Mochi dengan section halaman.
- Buat content/script.ts berisi naskah dari tabel di bagian 6: kursi, teks,
  ekspresi, dan nama file suara (file suaranya belum ada, isi namanya saja).
- Buat components/guide/Guide.tsx: tiap section punya satu "kursi". Saat
  section masuk layar, Mochi berpindah ke kursinya dengan animasi, lalu
  kalimatnya muncul kata demi kata di balon teks.
- Ikuti semua aturan perilaku di bagian 6: satu kalimat per kursi per
  kunjungan, kalimat yang terlewat saat scroll cepat dibatalkan, balon teks
  memakai aria-live="polite".
- Kalimat kursi "intro" muncul di terminal, dan kalimat "hero" diucapkan
  tepat setelah intro ditutup.
- Di HP, Mochi menempel di pojok bawah dan balon teksnya tidak menutupi isi
  utama.
- Mochi bisa diklik untuk reaksi kecil.
- Hapus halaman uji app/mascot jika sudah tidak diperlukan.

Selesai jika: scroll pelan dari atas ke bawah memunculkan enam kalimat sesuai
urutan, scroll balik tidak mengulang kalimat, dan scroll cepat ke bawah hanya
memunculkan kalimat section tempat berhenti.
```

---

## Fase 5 — Suara

```
Baca docs/MASTER_PLAN.md bagian 7.

Langkah 1 (diskusi dulu, jangan menulis kode): bandingkan pilihan
text-to-speech yang gratis untuk membuat enam file audio pendek berbahasa
Inggris, dengan karakter suara ceria, hangat, dan bernada sedang. Sertakan
model open-source yang bisa dijalankan di komputerku (Windows) dan layanan
daring dengan kuota gratis. Untuk tiap pilihan, periksa dokumentasi terbarunya:
cara pakai, kualitas, dan apakah lisensinya mengizinkan dipakai di situs
publik. Beri satu rekomendasi dan tunggu keputusanku.

Langkah 2 (setelah aku memilih): bantu aku membuat enam file dari teks di
content/script.ts, simpan di public/voice/ dengan nama sesuai kursi.

Langkah 3: buat components/guide/useVoice.ts.
- Suara mati secara default. Tombol suara di intro dan di pojok layar
  menyalakan atau mematikannya, pilihan disimpan di localStorage.
- Audio tidak pernah diputar sebelum ada interaksi pengunjung.
- File dimuat saat dibutuhkan, bukan semuanya di awal.
- Jika suara aktif, kemunculan kata dan gerak mulut Mochi mengikuti durasi
  audio. Jika mati, mengikuti kecepatan teks seperti di fase 4.
- Pindah kursi di tengah kalimat menghentikan audio yang sedang berjalan.

Selesai jika: suara menyala dan mati sesuai tombol, tidak ada dua kalimat yang
berbunyi bersamaan, dan situs tetap berfungsi penuh saat file audio gagal dimuat.
```

---

## Fase 6 — Isi dan pemolesan

```
Baca docs/MASTER_PLAN.md bagian 10 dan content/site.ts.

Langkah 1: wawancarai aku untuk melengkapi isi yang masih contoh. Tanyakan
satu per satu, jangan mengarang jawabannya:
- dua paragraf bio di About,
- empat angka statistik (pakai angka yang benar, atau hapus yang tidak ada
  datanya),
- daftar skill, supaya cocok dengan project yang benar-benar ada,
- apakah public/cv.pdf dan public/profile.jpg sudah ada.
Lalu tulis hasilnya ke content/site.ts, dalam bahasa Inggris.

Langkah 2: pemolesan.
- Sesuaikan naskah Mochi di content/script.ts jika isi section berubah
  (misalnya jumlah project).
- Transisi masuk tiap section yang seragam.
- Mochi berekspresi "curious" saat kursor berada di atas kartu project, dan
  "sleep" setelah pengunjung diam sekitar 30 detik.
- Perbarui metadata di app/layout.tsx: judul, deskripsi, gambar pratinjau.

Selesai jika: tidak ada teks contoh atau placeholder yang tersisa di situs.
```

---

## Fase 7 — Uji akhir

```
Baca docs/MASTER_PLAN.md bagian 9.

Tugas: uji seluruh situs dan perbaiki yang gagal. Jalankan situsnya dan
periksa langsung, jangan hanya membaca kode.
- Lebar layar: 375px, 768px, dan desktop.
- Keyboard saja: intro, navigasi, tombol suara, dan semua link bisa dicapai
  dan fokusnya terlihat.
- prefers-reduced-motion: tidak ada animasi yang mengganggu, semua isi tetap
  terbaca.
- WebGL dimatikan: tampilan cadangan shader muncul.
- Kecepatan muat: intro dan maskot tidak menunda tampilnya isi halaman.
  Jalankan Lighthouse dan laporkan skornya.
- Konsol browser bersih dari error.
- npm run build dan npm run lint lolos.

Laporkan dalam bentuk tabel: apa yang diuji, hasilnya, dan apa yang
diperbaiki. Jangan deploy atau push tanpa persetujuanku.
```
