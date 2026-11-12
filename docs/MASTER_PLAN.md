# Master Plan — Portofolio Rauh

Dokumen ini adalah acuan tunggal untuk merombak portofolio. Setiap fase di bagian 9 bisa dikerjakan sebagai satu sesi/prompt terpisah.

- **Referensi utama:** https://adamperlis.com/ (konsep intro terminal + pemandu bernaskah)
- **Stack saat ini:** Next.js 16.4.6, React 19.3, Tailwind CSS 4.3, TypeScript. Seluruh halaman ada di satu file `app/page.tsx`.
- **Aturan proyek:** sebelum menulis kode Next.js, baca panduan di `node_modules/next/dist/docs/` (lihat `AGENTS.md`). Versi ini berbeda dari Next.js yang umum dikenal.

---

## 1. Konsep

Pengunjung tidak "membaca" portofolio, mereka **ditemani**. Maskot berupa blob logam berwajah memandu dari atas ke bawah dan mengomentari tiap section dengan gaya jahil, seolah-olah ia AI assistant. Sebenarnya semua kalimatnya naskah yang ditulis tangan.

Alur pengalaman:

1. Layar pembuka berupa terminal yang mengetik sendiri.
2. Pengunjung menekan **Enter** (atau tombol "Enter" di HP).
3. Terminal menutup, maskot muncul dan menyapa.
4. Tiap kali pengunjung scroll ke section baru, maskot pindah ke section itu dan berbicara.

Yang **diambil** dari referensi: intro terminal, pemandu bernaskah yang berpindah per section, teks muncul kata demi kata, tombol suara, tombol "Skip intro".

Yang **sengaja dibedakan**: latar gelap (referensi putih), maskot blob logam buatan sendiri (bukan kepala 3D), naskah dan nama sendiri, suara text-to-speech.

---

## 2. Keputusan yang sudah diambil

| Hal | Keputusan |
|---|---|
| Bahasa pemandu | Inggris |
| Wujud maskot | Blob logam mengilap dengan wajah lucu (awalnya husky-blob, diganti di Fase 3) |
| Latar | Gelap dengan sentuhan metalik |
| Suara | Text-to-speech untuk kalimat maskot |
| Nama pemilik | Rauh. Nama panggilan: Hessed. Maskot memanggilnya "Rauh" |
| Nama maskot | Mochi |
| Karakter suara | Ceria dan hangat, nada sedang (bukan suara kecil/melengking) |

---

## 3. Arah visual

**Kesan:** gelap, dingin, metalik. Seperti logam yang disikat, bukan neon.

**Warna (token awal, boleh digeser saat fase 1):**

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--bg` | `#08090b` | Latar utama |
| `--surface` | `#111317` | Kartu, panel terminal |
| `--line` | `rgba(255,255,255,0.08)` | Garis dan border |
| `--text` | `#e7e9ec` | Teks utama |
| `--muted` | `#8b9099` | Teks sekunder |
| `--metal-1` / `--metal-2` | `#f2f4f7` → `#6d737d` | Gradien metalik untuk judul besar |
| `--accent` | `#8fd8ff` | Biru es, dipakai hemat |

**Yang diganti dari desain sekarang:** tiga orb biru yang melayang dan grid tipis di latar. Biru elektrik `#2d7bff` tidak lagi menjadi warna dominan.

**Efek metalik:**

- Satu elemen shader "liquid metal" di hero (WebGL), sebagai titik fokus. Bukan di seluruh halaman.
- Judul besar memakai gradien metalik lewat CSS (`background-clip: text`), tanpa WebGL.
- Kartu project: border tipis dengan kilau yang mengikuti kursor (pengganti efek kaca biru).

**Tipografi:** satu font sans untuk isi dan satu font mono untuk terminal, label, dan angka section. Inter + JetBrains Mono yang sekarang boleh dipertahankan, atau diganti di fase 1.

---

## 4. Intro terminal

Tampilan: panel terminal di tengah layar gelap, judul jendela `rauh@portfolio ~ zsh`.

Urutan (diketik otomatis, total sekitar 4–5 detik):

```
~ $ npx start @rauh

Need to install the following packages:
  @rauh/portfolio
Ok to proceed? (y) y

✔ role      Full-Stack Developer
✔ based     Balikpapan, Indonesia
✔ shipped   7 projects
✔ status    open to work
+ guide     Mochi

➜ press ENTER to continue
```

Aturan:

- **Enter** (keyboard) atau tombol **Enter** di layar (HP) menutup intro.
- Tombol **Skip intro** selalu terlihat.
- Tombol **Sound On/Off** ada di intro. Karena browser melarang audio sebelum ada interaksi, penekanan Enter sekaligus menjadi izin memutar suara.
- Intro hanya tampil sekali per sesi (disimpan di `sessionStorage`). Kunjungan berikutnya langsung ke halaman.
- Jika pengunjung memakai `prefers-reduced-motion`, teks terminal langsung tampil utuh tanpa efek ketik.
- Isi halaman tetap ada di HTML di belakang intro, supaya mesin pencari tetap bisa membacanya.

---

## 5. Maskot

**Wujud:** blob oval dari logam cair yang mengilap seperti krom, dengan wajah sederhana: dua mata hitam bulat berkilau dan mulut kecil. Satu keluarga dengan bola logam di hero. (Rencana awal husky-blob diganti di Fase 3 atas pilihan pemilik.)

**Teknik:** badan memakai shader liquid metal yang sama dengan hero (`MetalShader` dengan tampilan `soft`, lebih cerah dan halus supaya wajah terbaca), dipipihkan jadi oval. Wajah berupa SVG di atasnya dengan garis terang tipis supaya tetap terbaca di atas pantulan gelap. Tanpa WebGL atau dengan prefers-reduced-motion, badan memakai cakram logam CSS. Kode: `components/guide/Mascot.tsx`, daftar ekspresi di `components/guide/expressions.ts`, animasi di `app/globals.css` bagian MOCHI.

**Ekspresi yang dibutuhkan (6):**

| Nama | Kapan dipakai |
|---|---|
| `idle` | Diam, bernapas pelan, sesekali berkedip |
| `talk` | Mulut bergerak selama kalimat muncul |
| `happy` | Menyapa, section Contact |
| `smug` | Saat melontarkan lelucon |
| `curious` | Kepala miring, saat pengunjung mengarahkan kursor ke project |
| `sleep` | Pengunjung diam lebih dari ±30 detik |

**Interaksi:** klik maskot untuk reaksi kecil (memantul seperti jeli, bunyi "boing" pelan jika suara aktif). Di HP, maskot menempel di pojok bawah supaya tidak menutupi isi.

---

## 6. Sistem pemandu

**Kursi:** tiap section punya satu titik tempat maskot "duduk". Saat section itu masuk layar, maskot berpindah ke kursinya lalu kalimatnya muncul kata demi kata.

| Kursi | Section |
|---|---|
| `intro` | Baris terakhir terminal |
| `hero` | Setelah Enter ditekan |
| `about` | 01 About |
| `projects` | 02 Projects |
| `skills` | 03 Skills |
| `contact` | 04 Contact |

**Aturan perilaku:**

- Satu kalimat per kursi per kunjungan. Jika pengunjung scroll balik, maskot pindah tetapi tidak mengulang kalimat.
- Jika pengunjung scroll cepat melewati beberapa section, kalimat yang terlewat dibatalkan. Hanya section tempat ia berhenti yang diucapkan.
- Teks kalimat selalu tampil, baik suara aktif maupun mati.
- Balon teks memakai `aria-live="polite"` supaya terbaca oleh pembaca layar.

**Naskah disimpan di satu file data** (`content/script.ts`), terpisah dari kode animasi, dengan bentuk: kursi, teks, ekspresi, file suara. Kolom ekspresi = ekspresi Mochi setelah selesai bicara; selama bicara selalu `talk`.

**Implementasi (Fase 4):** satu Mochi untuk seluruh halaman (`components/guide/Guide.tsx`). Di layar lebar Mochi terbang ke kotak kursi (`GuideSeat`) dan melirik ke kalimatnya; di HP (<768px) Mochi menempel di pojok kanan bawah. Kalimat selalu berada di alur section, jadi tidak menutupi isi. Kursi aktif setelah berada di tengah layar ±0,45 detik; di bagian paling atas, hero dipilih jika tidak ada kursi lain. Kalimat yang terpotong karena pindah kursi langsung tampil utuh. Untuk pembaca layar, kalimat diumumkan utuh sekaligus lewat wilayah `aria-live` tersembunyi, bukan kata demi kata.

**Draf naskah (Inggris, sudut pandang maskot, boleh diubah bebas):**

| Kursi | Kalimat | Ekspresi |
|---|---|---|
| `intro` | "Oh, a visitor! I'm Mochi. Press Enter and I'll show you around." | `happy` |
| `hero` | "That's Rauh. Everyone calls him Hessed. He made me, so I have to say nice things." | `smug` |
| `about` | "This is where he talks about himself. I'd skim it, but I'm a blob of liquid metal." | `happy` |
| `projects` | "Seven things he built. One of them is three furniture stores in a trench coat." | `smug` |
| `skills` | "The tools he uses. I can't use any of them. No thumbs." | `curious` |
| `contact` | "That's the tour. If you liked it, email him. If you didn't, it was my fault." | `happy` |

---

## 7. Suara (text-to-speech)

Karena naskahnya tetap, suara **dibuat sekali di awal** lalu disimpan sebagai file audio. Suara tidak dibuat saat pengunjung membuka situs.

| Pilihan | Kelebihan | Kekurangan |
|---|---|---|
| **File audio jadi (dipilih)** | Suara sama di semua perangkat, bisa pilih karakter suara, tanpa biaya per pengunjung | Tiap ganti naskah harus membuat ulang filenya |
| Suara bawaan browser (Web Speech API) | Gratis, tanpa file | Suara berbeda di tiap perangkat, sering terdengar kaku, tidak tersedia di semua browser |

Rincian:

- Satu file per kalimat di `public/voice/` (misalnya `hero.mp3`), ukuran kecil, dimuat saat dibutuhkan.
- Pembuatan file dilakukan di luar situs. **Diputuskan di Fase 5: Kokoro-82M (lisensi Apache 2.0), suara `af_heart`, kecepatan normal**, dijalankan di komputer sendiri lewat `kokoro-onnx`. Skripnya `scripts/voice/generate.py` membaca teks langsung dari `content/script.ts`; jalankan ulang setiap kali naskah berubah. Nama Rauh, Hessed, dan Mochi diberi ejaan khusus di skrip itu karena dibaca salah oleh TTS. Lingkungan Python dan file model (±340 MB) tidak di-commit.
- Pemutarnya `components/guide/useVoice.ts`. Suara Mochi hanya berbunyi jika pilihan suara On dan pengunjung sudah berinteraksi; satu kalimat pada satu waktu; jika file gagal dimuat, teks memakai kecepatan biasa. Tombol suara ada di intro dan di navbar.
- Karakter suara: ceria dan hangat, nada sedang.
- Suara **mati secara default**. Pengunjung menyalakannya lewat tombol di intro atau di pojok layar. Pilihan disimpan di `localStorage`.
- Gerak mulut maskot mengikuti durasi audio jika suara aktif, atau mengikuti kecepatan teks jika mati.

---

## 8. Struktur kode

`app/page.tsx` yang sekarang 800 baris dipecah supaya tiap bagian bisa dikerjakan terpisah:

```
app/
  page.tsx              merangkai section
  layout.tsx            font, metadata
  globals.css           token warna, gaya dasar
content/
  site.ts               data pribadi, project, skill (dari BAGIAN 1 sekarang)
  script.ts             naskah maskot
components/
  intro/Terminal.tsx
  guide/Mascot.tsx      badan shader logam + wajah SVG + ekspresi
  guide/Guide.tsx       logika kursi, scroll, balon teks
  guide/useVoice.ts     pemutar suara + tombol
  sections/Hero.tsx, About.tsx, Projects.tsx, Skills.tsx, Contact.tsx
  ui/MetalText.tsx, MetalShader.tsx, Reveal.tsx
public/
  voice/                file audio per kalimat
```

**Library yang diusulkan** (versi dan API harus dicek di dokumentasi masing-masing sebelum dipasang):

| Kebutuhan | Usulan |
|---|---|
| Shader liquid metal | `@paper-design/shaders-react` (keluarga shader yang sama dengan referensi) |
| Animasi maskot dan balon teks | `motion` |
| Smooth scroll | `lenis` (opsional, boleh ditunda) |

Deteksi section memakai `IntersectionObserver` bawaan browser, seperti komponen `Reveal` yang sudah ada.

---

## 9. Fase pengerjaan

Setiap fase menghasilkan situs yang tetap bisa dijalankan.

| Fase | Isi | Selesai jika |
|---|---|---|
| **0. Fondasi** | Pecah `page.tsx` ke struktur di bagian 8, pindahkan data ke `content/`. Tampilan tidak berubah. | Halaman terlihat sama persis, `npm run build` lolos |
| **1. Visual dasar** | Token warna baru, hapus orb biru, judul metalik, gaya kartu baru, shader di hero | Seluruh section memakai palet baru, tidak ada sisa biru elektrik |
| **2. Intro terminal** | Komponen terminal, efek ketik, Enter/Skip, `sessionStorage` | Intro tampil sekali per sesi, bisa dilewati, berfungsi di HP |
| **3. Maskot** | Blob logam berwajah dan 6 ekspresi | Semua ekspresi bisa dipicu dari satu halaman uji |
| **4. Sistem pemandu** | Kursi per section, perpindahan saat scroll, teks kata demi kata, naskah dari `content/script.ts` | Scroll dari atas ke bawah memunculkan 6 kalimat sesuai urutan, tanpa pengulangan |
| **5. Suara** | File audio, tombol suara, sinkron mulut | Suara menyala dan mati sesuai tombol, tidak pernah berbunyi sebelum interaksi |
| **6. Isi dan pemolesan** | Lengkapi bio dan angka, interaksi kartu project, transisi antar section | Tidak ada teks contoh yang tersisa |
| **7. Uji akhir** | HP, `prefers-reduced-motion`, keyboard, kecepatan muat, lalu deploy | Lolos di HP dan desktop, intro dan maskot tidak menghambat muat halaman |

Fase 3 bisa dikerjakan bersamaan dengan fase 1 dan 2 karena tidak menyentuh file yang sama.

---

## 10. Yang masih perlu diputuskan atau dilengkapi

1. **Alat text-to-speech.** Ditunda sampai fase 5. Karakter suaranya sudah diputuskan (bagian 2).
2. **Isi yang masih contoh di situs sekarang:** dua paragraf bio di About dan empat angka statistik ("3+ Years coding", "12 Projects shipped", dan seterusnya).
3. **File yang dirujuk:** `public/cv.pdf` dan `public/profile.jpg` perlu dipastikan ada.
4. **Skill yang ditampilkan** tidak seluruhnya cocok dengan project yang ada (misalnya PyTorch dan Docker tidak muncul di project mana pun, sedangkan Go dan Java muncul tetapi tidak ada di daftar skill).
