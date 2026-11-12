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
    "I build practical software — quality-of-life tools, apps that bring local businesses online, and the interfaces people actually touch.",
  // >>> GANTI DENGAN DATA KAMU: teks status kecil di atas nama (kosongkan "" untuk menyembunyikan)
  status: "Open to work",
  // >>> GANTI DENGAN DATA KAMU: lokasi
  location: "Balikpapan, Indonesia",
  // >>> GANTI DENGAN DATA KAMU: email
  email: "rauhrisqiabdil@gmail.com",
  // >>> GANTI DENGAN DATA KAMU: file CV — taruh PDF-nya di folder /public lalu
  //     isi "/cv.pdf". Selama kosong "", tombol CV disembunyikan.
  cvUrl: "",
  // >>> GANTI DENGAN DATA KAMU: foto — taruh di folder /public lalu isi
  //     "/profile.jpg". Selama kosong "", tampil kotak berisi inisial nama.
  photo: "",
  // >>> GANTI DENGAN DATA KAMU: alamat situs setelah online, misalnya
  //     "https://rauh.vercel.app". Kosongkan "" kalau belum ada.
  url: "",
};

// >>> GANTI DENGAN DATA KAMU: link sosial media (hapus / tambah baris sesukamu)
export const SOCIALS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/Hojiez" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rauh-abdillah-5ab331326/" },
  { label: "Instagram", href: "https://instagram.com/mehemew" },
];

export const ABOUT = {
  // >>> GANTI DENGAN DATA KAMU: kalimat pembuka besar di About (ringkasan bio)
  headline: "I got into code by poking at game security. Now I build things that make life a little easier.",
  // >>> GANTI DENGAN DATA KAMU: bio — tiap string = satu paragraf
  bio: [
    "I'm a Computer Science student at BINUS University Malang. I got into programming through security: I started out making cheats for games, got curious about how game security actually works, and was already writing my own programs in junior high.",
    "I like building quality-of-life tools, such as external apps that make games easier to play, and projects that help people directly, like bringing traditional shops into the modern era with a proper database behind them. Right now I'm studying operating systems and compilation techniques, and next I want to go deeper into cybersecurity.",
  ],
  // >>> GANTI DENGAN DATA KAMU: angka sorotan (maksimal 4 supaya rapi)
  // (dibuat sebagai getter supaya jumlah project otomatis mengikuti PROJECTS)
  get stats() {
    return [
      { value: "3+", label: "Years coding" },
      { value: String(PROJECTS.length), label: "Projects shipped" },
      { value: "C1", label: "English, certified Advanced" },
      // bahasa pemrograman di project: JavaScript, TypeScript, Go, Java, Python
      { value: "5", label: "Languages shipped in" },
    ];
  },
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
    title: "Furniture Store (v2)",
    description:
      "Full-stack furniture store web app with JWT login, payments through Midtrans, and AI features powered by Google Gemini.",
    category: "Web",
    tech: ["Node.js", "Express", "PostgreSQL", "JWT", "Midtrans", "Gemini API"],
    liveUrl: "https://app-database-new.vercel.app",
    repoUrl: "https://github.com/Hojiez/app-database-new",
  },
  {
    title: "Furniture Store (Go)",
    description:
      "The furniture store backend rewritten in Go with the Gin framework, connected to a MySQL database.",
    category: "Backend",
    tech: ["Go", "Gin", "MySQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan_golang",
  },
  {
    title: "Furniture Store",
    description:
      "CRUD database app for a furniture store, with an Express and PostgreSQL REST API and a simple web interface.",
    category: "Backend",
    tech: ["Node.js", "Express", "PostgreSQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan",
  },
  {
    title: "Stroke Rehab",
    description:
      "Web app for managing stroke patients' rehabilitation records, built with Spring Boot, Thymeleaf, and MySQL.",
    category: "Web",
    tech: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
    repoUrl: "https://github.com/Hojiez/rehab",
  },
  {
    title: "Expo Assignment",
    description:
      "React Native mobile app with Expo Router and tab navigation, built for a mobile app development course.",
    category: "Mobile",
    tech: ["React Native", "Expo", "TypeScript"],
    repoUrl: "https://github.com/Hojiez/tugas-expo",
  },
  {
    title: "Fish Watcher",
    description:
      "Desktop app that watches Discord messages and automatically joins Roblox servers, with a GUI and desktop notifications.",
    category: "Tools",
    tech: ["Python", "Playwright", "CustomTkinter"],
    repoUrl: "https://github.com/Hojiez/fish-watcher",
  },
  {
    title: "rauh. — Old Portfolio",
    description:
      "Dark, minimalist single-page portfolio with glassmorphism, a particle background, and a shuffle music player.",
    category: "Web",
    tech: ["HTML", "Tailwind CSS", "JavaScript"],
    liveUrl: "https://hojiez.github.io/porto/",
    repoUrl: "https://github.com/Hojiez/porto",
  },
];

// >>> GANTI DENGAN DATA KAMU: tech stack, dikelompokkan
export const SKILLS: { group: string; items: string[] }[] = [
  // (semua skill di bawah dipakai di project yang dipajang di atas)
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Go", "Java"],
  },
  {
    group: "Web & Mobile",
    items: ["React", "Next.js", "React Native (Expo)", "Tailwind CSS", "HTML/CSS"],
  },
  {
    group: "Backend & Data",
    items: ["Node.js", "Express", "Gin", "Spring Boot", "PostgreSQL", "MySQL", "REST API"],
  },
  {
    group: "Tools",
    items: ["Git", "Vercel", "Playwright", "Gemini API"],
  },
];

// Menu navigasi — href harus cocok dengan id section.
export const NAV = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];
