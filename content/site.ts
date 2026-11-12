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
    "I build small tools that save people time, and web apps that move local shops from paper records to a real database.",
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
  headline: "I learned to code by writing game cheats. Now I build apps for shops that still keep their records on paper.",
  // >>> GANTI DENGAN DATA KAMU: bio — tiap string = satu paragraf
  bio: [
    "I study Computer Science at BINUS University Malang. My first programs were game cheats. I wanted to know how games caught cheaters, so by junior high I was writing my own tools to find out.",
    "I still like small tools that fix one annoying thing, like external helpers that make a game easier to play. I also like projects with a real person on the other end, such as moving a traditional shop's records into a proper database. Right now I'm studying operating systems and compiler construction. Cybersecurity is next.",
  ],
  // >>> GANTI DENGAN DATA KAMU: angka sorotan (maksimal 4 supaya rapi)
  // (dibuat sebagai getter supaya jumlah project otomatis mengikuti PROJECTS)
  get stats() {
    return [
      { value: "3+", label: "Years coding" },
      { value: String(PROJECTS.length), label: "Projects built" },
      { value: "C1", label: "English (certified)" },
      // bahasa pemrograman di project: JavaScript, TypeScript, Go, Java, Python
      { value: "5", label: "Programming languages" },
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
      "An online furniture store with JWT login, Midtrans payments, and Google Gemini for the AI features.",
    category: "Web",
    tech: ["Node.js", "Express", "PostgreSQL", "JWT", "Midtrans", "Gemini API"],
    liveUrl: "https://app-database-new.vercel.app",
    repoUrl: "https://github.com/Hojiez/app-database-new",
  },
  {
    title: "Furniture Store (Go)",
    description:
      "The same furniture store backend, rewritten in Go with Gin and a MySQL database.",
    category: "Backend",
    tech: ["Go", "Gin", "MySQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan_golang",
  },
  {
    title: "Furniture Store",
    description:
      "The first version: a CRUD app for a furniture store, with an Express and PostgreSQL REST API behind a plain web page.",
    category: "Backend",
    tech: ["Node.js", "Express", "PostgreSQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan",
  },
  {
    title: "Stroke Rehab",
    description:
      "Keeps track of stroke patients' rehab records. Built with Spring Boot, Thymeleaf, and MySQL.",
    category: "Web",
    tech: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
    repoUrl: "https://github.com/Hojiez/rehab",
  },
  {
    title: "Expo Assignment",
    description:
      "Coursework for a mobile development class: a React Native app with Expo Router and tab navigation.",
    category: "Mobile",
    tech: ["React Native", "Expo", "TypeScript"],
    repoUrl: "https://github.com/Hojiez/tugas-expo",
  },
  {
    title: "Fish Watcher",
    description:
      "Watches Discord messages and joins the Roblox server for you, then pings you with a desktop notification.",
    category: "Tools",
    tech: ["Python", "Playwright", "CustomTkinter"],
    repoUrl: "https://github.com/Hojiez/fish-watcher",
  },
  {
    title: "rauh. — Old Portfolio",
    description:
      "My previous portfolio, a single dark page with frosted-glass panels, floating particles, and a music player on shuffle.",
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
