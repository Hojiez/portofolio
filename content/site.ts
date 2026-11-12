/**
 * ============================================================================
 *  DATA PRIBADI — semua isi situs ada di file ini.
 *  CARA EDIT: cari tulisan  "GANTI DENGAN DATA KAMU"  (Ctrl+F). Kamu tidak
 *  perlu menyentuh file komponen untuk mengganti isi.
 * ============================================================================
 */

export const SITE = {
  // >>> GANTI DENGAN DATA KAMU: nama lengkap (tampil besar di hero)
  name: "Rauh Risqi Abdillah",
  // >>> GANTI DENGAN DATA KAMU: nama pendek / inisial untuk logo di navbar
  shortName: "Rauh",
  // >>> GANTI DENGAN DATA KAMU: jabatan / peran
  role: "Full-Stack Developer",
  // >>> GANTI DENGAN DATA KAMU: satu kalimat pembuka di hero
  tagline:
    "I build fast, clean web products — from smart contracts and AI tooling to the interfaces people actually touch.",
  // >>> GANTI DENGAN DATA KAMU: teks status kecil di atas nama (kosongkan "" untuk menyembunyikan)
  status: "Open to work",
  // >>> GANTI DENGAN DATA KAMU: lokasi
  location: "Balikpapan, Indonesia",
  // >>> GANTI DENGAN DATA KAMU: email
  email: "rauhrisqiabdil@gmail.com",
  // >>> GANTI DENGAN DATA KAMU: file CV — taruh PDF-nya di folder /public
  cvUrl: "/cv.pdf",
  // >>> GANTI DENGAN DATA KAMU: path foto — taruh fotonya di folder /public
  //     (kalau file tidak ada, otomatis diganti kotak berisi inisial nama)
  photo: "/profile.jpg",
};

// >>> GANTI DENGAN DATA KAMU: link sosial media (hapus / tambah baris sesukamu)
export const SOCIALS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/Hojiez" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rauh-abdillah-5ab331326/" },
  { label: "Instagram", href: "https://instagram.com/mehemew" },
];

export const ABOUT = {
  // >>> GANTI DENGAN DATA KAMU: bio — tiap string = satu paragraf
  bio: [
    "Tulis paragraf pertama bio kamu di sini. Ceritakan siapa kamu, apa yang sedang kamu kerjakan, dan apa yang membuatmu tertarik pada bidang ini.",
    "Paragraf kedua: pengalaman, cara kerja, atau hal yang ingin kamu pelajari berikutnya. Singkat saja — dua sampai tiga kalimat sudah cukup.",
  ],
  // >>> GANTI DENGAN DATA KAMU: angka sorotan (maksimal 4 supaya rapi)
  stats: [
    { value: "3+", label: "Years coding" },
    { value: "12", label: "Projects shipped" },
    { value: "4", label: "Hackathons" },
    { value: "∞", label: "Cups of coffee" },
  ],
};

// Kategori filter project. Boleh diganti, tapi "All" harus tetap ada di depan.
// >>> GANTI DENGAN DATA KAMU (opsional): daftar kategori
export const CATEGORIES = ["All", "Web", "Backend", "Mobile", "Tools"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Project = {
  title: string;
  description: string;
  category: Exclude<Category, "All">;
  tech: string[];
  liveUrl?: string; // opsional — hapus kalau tidak ada demo
  repoUrl?: string; // opsional — hapus kalau repo privat
};

// >>> GANTI DENGAN DATA KAMU: daftar project
export const PROJECTS: Project[] = [
  {
    title: "Toko Perabotan (v2)",
    description:
      "Aplikasi web toko perabotan full-stack dengan login JWT, pembayaran via Midtrans, dan fitur AI berbasis Google Gemini.",
    category: "Web",
    tech: ["Node.js", "Express", "PostgreSQL", "JWT", "Midtrans", "Gemini API"],
    liveUrl: "https://app-database-new.vercel.app",
    repoUrl: "https://github.com/Hojiez/app-database-new",
  },
  {
    title: "Toko Perabotan (Go)",
    description:
      "Versi backend aplikasi toko perabotan yang ditulis ulang dengan Go dan framework Gin, terhubung ke database MySQL.",
    category: "Backend",
    tech: ["Go", "Gin", "MySQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan_golang",
  },
  {
    title: "Toko Perabotan",
    description:
      "Aplikasi CRUD database toko perabotan dengan REST API Express dan PostgreSQL, plus antarmuka web sederhana.",
    category: "Backend",
    tech: ["Node.js", "Express", "PostgreSQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan",
  },
  {
    title: "Rehab Stroke",
    description:
      "Aplikasi web untuk pengelolaan data rehabilitasi pasien stroke, dibangun dengan Spring Boot, Thymeleaf, dan MySQL.",
    category: "Web",
    tech: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
    repoUrl: "https://github.com/Hojiez/rehab",
  },
  {
    title: "Tugas Expo",
    description:
      "Aplikasi mobile React Native dengan Expo Router dan navigasi tab, dibuat sebagai tugas pengembangan aplikasi mobile.",
    category: "Mobile",
    tech: ["React Native", "Expo", "TypeScript"],
    repoUrl: "https://github.com/Hojiez/tugas-expo",
  },
  {
    title: "Fish Watcher",
    description:
      "Aplikasi desktop yang memantau pesan Discord dan otomatis bergabung ke server Roblox, dengan GUI dan notifikasi desktop.",
    category: "Tools",
    tech: ["Python", "Playwright", "CustomTkinter"],
    repoUrl: "https://github.com/Hojiez/fish-watcher",
  },
  {
    title: "rauh. — Portfolio Lama",
    description:
      "Portfolio single-page bergaya dark minimalist dengan glassmorphism, background partikel, dan pemutar musik acak.",
    category: "Web",
    tech: ["HTML", "Tailwind CSS", "JavaScript"],
    liveUrl: "https://hojiez.github.io/porto/",
    repoUrl: "https://github.com/Hojiez/porto",
  },
];

// >>> GANTI DENGAN DATA KAMU: tech stack, dikelompokkan
export const SKILLS: { group: string; items: string[] }[] = [
  {
    group: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "HTML/CSS"],
  },
  {
    group: "Backend",
    items: ["Node.js", "Express", "Python", "PostgreSQL", "REST API"],
  },
  {
    group: "AI & Data",
    items: ["PyTorch", "scikit-learn", "Pandas", "LLM APIs"],
  },
  {
    group: "Tools",
    items: ["Git", "Docker", "Figma", "Vercel", "Linux"],
  },
];

// Menu navigasi — href harus cocok dengan id section.
export const NAV = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];
