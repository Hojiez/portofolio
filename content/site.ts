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
  //     (sumbernya docs/cv/cv.html)
  cvUrl: "/Rauh-Risqi-Abdillah-CV.pdf",
  // >>> GANTI DENGAN DATA KAMU: foto — taruh di folder /public lalu isi
  //     "/profile.jpg". Selama kosong "", tampil kotak berisi inisial nama.
  photo: "/profile.jpg",
  // >>> GANTI DENGAN DATA KAMU: alamat situs setelah online, misalnya
  //     "https://rauh.vercel.app". Kosongkan "" kalau belum ada.
  url: "https://portofolio-gbos.vercel.app",
};

// >>> GANTI DENGAN DATA KAMU: link sosial media (hapus / tambah baris sesukamu)
export const SOCIALS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/Hojiez" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rauh-abdillah-5ab331326/" },
  { label: "Instagram", href: "https://instagram.com/mehemew" },
];

export const ABOUT = {
  // >>> GANTI DENGAN DATA KAMU: kalimat pembuka besar di About (ringkasan bio)
  headline: "I got into code to cheat at games. I stayed because building things for real people turned out to be more fun.",
  // >>> GANTI DENGAN DATA KAMU: bio — tiap string = satu paragraf
  bio: [
    "I'm a Computer Science student at BINUS University Malang, from Balikpapan. As a kid I wanted to win without the grind, so I taught myself to write cheats. By high school the question had flipped: how do games catch people like me? That's how I ended up reading about anti-cheat and game security.",
    "Now my projects come in two sizes. Small tools that fix one annoying thing, and bigger apps with an actual person on the other end, like the point-of-sale system my team built after I visited a neighborhood grocery store to see how the owner tracks sales and stock. This semester it's operating systems and compiler construction. Cybersecurity is where I want to go next.",
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
  // opsional — animasi demo (WebP berulang) di public/projects/, ditambah
  // poster diam untuk pengunjung yang mematikan animasi. Ukuran 800×500.
  media?: { src: string; poster: string; alt: string };
  // opsional — isi panel detail yang terbuka saat kartu project diklik
  details?: ProjectDetails;
};

export type ProjectDetails = {
  /** satu paragraf: apa project ini dan untuk siapa */
  overview: string;
  /** cara dibuat: keputusan teknis dan bagian-bagiannya */
  built: string[];
  /** fitur yang paling menarik untuk ditunjukkan */
  highlights?: string[];
  // >>> GANTI DENGAN DATA KAMU: tiga kolom di bawah ini hanya kamu yang tahu.
  //     Kosongkan (hapus barisnya) dan bagiannya tidak tampil di panel.
  /** peranmu di project ini (terutama untuk project tim) */
  role?: string;
  /** bagian yang paling sulit dan bagaimana kamu menyelesaikannya */
  challenge?: string;
  /** apa yang kamu pelajari */
  learned?: string;
};

// Peran Rauh di semua project (kata Rauh: ketua tim, ±80% pengerjaan).
const LEAD = "Team lead. I planned the work, split the tasks and wrote about 80% of the code.";

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
    details: {
      overview:
        "An online furniture store with three kinds of users: customers who browse, order and pay, cashiers who handle in-store sales, and an admin who runs the shop.",
      built: [
        "Express REST API deployed on Vercel as a serverless function, with PostgreSQL behind it.",
        "JWT login with role checks on every route, so customers, cashiers and the admin each see only their own endpoints.",
        "Midtrans for online payments; cash orders wait for a cashier to confirm them.",
        "Google Gemini writes sales-trend notes for the admin, with a fallback message when the API fails or returns something unusable.",
      ],
      highlights: [
        "Admin dashboard with revenue trend, top-selling products and AI sales insights.",
        "Customers can track orders, see their history and leave reviews.",
      ],
      role: LEAD,
      challenge:
        "Keeping three roles apart. Every route has to know who is calling, so the JWT check lives in middleware with a list of allowed roles per route instead of being repeated in each handler. Gemini was the other tricky part: when its reply crashes or doesn't parse, the dashboard shows a fallback message instead of breaking.",
    },
  },
  {
    title: "Toko Sumber Makmur POS",
    description:
      "A point-of-sale system for a neighborhood grocery store, built as a BINUS team project. I went to the shop in person to see how the owner handles sales and stock.",
    category: "Web",
    tech: ["Vue 3", "Laravel 11", "SQLite"],
    // tidak ada repo publik atau demo: proyek untuk toko sungguhan
    details: {
      overview:
        "A point-of-sale system for Toko Sumber Makmur, a neighborhood grocery store. Built by a BINUS team for a real shop rather than a made-up brief.",
      built: [
        "Vue 3 frontend for the checkout screens.",
        "Laravel 11 backend with an SQLite database.",
      ],
      highlights: ["I went to the shop in person to see how the owner sells and keeps track of stock before the system was built."],
      role: LEAD,
      challenge:
        "Building for a real person instead of a class brief. What the owner actually does at the counter decided the screens and the database, so the visit to the shop came before any design.",
    },
  },
  {
    title: "Furniture Store (Go)",
    description:
      "The same furniture store backend, rewritten in Go with Gin and a MySQL database.",
    category: "Backend",
    tech: ["Go", "Gin", "MySQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan_golang",
    details: {
      overview: "The furniture store backend rewritten in Go, to see how the same API looks in a compiled, typed language.",
      built: [
        "Gin web framework with the MySQL driver.",
        "Endpoints for login, product CRUD and transactions.",
        "Admin stats, revenue trend and top-selling queries ported from the Node.js version.",
      ],
      role: LEAD,
      challenge:
        "Porting from JavaScript to Go. Every database row needs an explicit type and every call returns an error to handle, where the Node.js version let those slide.",
    },
  },
  {
    title: "Furniture Store",
    description:
      "The first version: a CRUD app for a furniture store, with an Express and PostgreSQL REST API behind a plain web page.",
    category: "Backend",
    tech: ["Node.js", "Express", "PostgreSQL", "HTML"],
    repoUrl: "https://github.com/Hojiez/app_database_perabotan",
    details: {
      overview: "The first version of the furniture store: a CRUD app with a REST API and a plain HTML page on top.",
      built: [
        "Express and PostgreSQL, with parameterized queries throughout.",
        "Checkout runs inside a database transaction (BEGIN, COMMIT, ROLLBACK), so a failed order never leaves stock half-updated.",
        "Case-insensitive product search.",
      ],
      role: LEAD,
      challenge:
        "Checkout touches several tables at once. If one write failed halfway, stock could end up wrong, so the whole checkout runs in a single transaction and rolls back on any error.",
    },
  },
  {
    title: "Stroke Rehab",
    description:
      "Keeps track of stroke patients' rehab records. Built with Spring Boot, Thymeleaf, and MySQL.",
    category: "Web",
    tech: ["Java", "Spring Boot", "Thymeleaf", "MySQL"],
    repoUrl: "https://github.com/Hojiez/rehab",
    details: {
      overview:
        "NeuroMotion: a web app that helps stroke patients follow their rehab exercises and lets staff see how they are doing.",
      built: [
        "Spring Boot MVC with server-rendered Thymeleaf pages and MySQL.",
        "Patient registration, login and profile pages.",
        "Exercises with a history of completed sessions and feedback after each one.",
      ],
      highlights: ["An SOS alert page for patients.", "An admin panel that can reset weekly progress for everyone."],
      role: LEAD,
      challenge:
        "Separating weekly progress from history. Exercise history is stored in its own table, so the admin can reset everyone's week without losing what patients have done before.",
    },
  },
  {
    title: "Expo Assignment",
    description:
      "Coursework for a mobile development class: a React Native app with Expo Router and tab navigation.",
    category: "Mobile",
    tech: ["React Native", "Expo", "TypeScript"],
    liveUrl: "https://tugas-expo.vercel.app",
    repoUrl: "https://github.com/Hojiez/tugas-expo",
    media: {
      src: "/projects/expo.webp",
      poster: "/projects/expo-poster.webp",
      alt: "The Expo app on a phone screen, switching between the Home, About and Simple tabs",
    },
    details: {
      overview: "Coursework for a mobile development class: a small React Native app to learn navigation in Expo.",
      built: [
        "Expo Router with a tab layout (Home and About) and a separate stack screen.",
        "TypeScript throughout.",
        "Exported to a static web build and deployed on Vercel, so it runs in a browser too.",
      ],
      role: LEAD,
      challenge:
        "Learning file-based routing: in Expo Router the folder structure is the navigation, so getting tabs and a stack screen to share one layout meant planning the folders first.",
    },
  },
  {
    title: "Fish Watcher",
    description:
      "Watches Discord messages and joins the Roblox server for you, then pings you with a desktop notification.",
    category: "Tools",
    tech: ["Python", "Playwright", "CustomTkinter"],
    repoUrl: "https://github.com/Hojiez/fish-watcher",
    details: {
      overview:
        "A desktop helper for a Roblox game: it watches a Discord channel for server announcements and joins the right server for you.",
      built: [
        "Playwright reads the Discord channel in a browser it controls.",
        "The watcher runs on its own thread with asyncio, so the window never freezes.",
        "A CustomTkinter window to start and stop watching, with settings saved locally.",
      ],
      highlights: ["Joins the Roblox server by its place ID and sends a desktop notification when it does."],
      role: LEAD,
      challenge:
        "Keeping the window responsive. The watcher runs its own asyncio loop on a separate thread and sends updates back to the GUI through a thread-safe callback, because Tkinter freezes if anything else touches it directly.",
    },
  },
  {
    title: "rauh. — Old Portfolio",
    description:
      "My previous portfolio, a single dark page with frosted-glass panels, floating particles, and a music player on shuffle.",
    category: "Web",
    tech: ["HTML", "Tailwind CSS", "JavaScript"],
    liveUrl: "https://hojiez.github.io/porto/",
    repoUrl: "https://github.com/Hojiez/porto",
    media: {
      src: "/projects/old-portfolio.webp",
      poster: "/projects/old-portfolio-poster.webp",
      alt: "Scrolling through the old portfolio: profile card, tech stack and project list on a dark particle background",
    },
    details: {
      overview: "My previous portfolio, before this one: a single dark page hosted on GitHub Pages.",
      built: [
        "Plain HTML, Tailwind CSS and JavaScript, no framework.",
        "A particle background and frosted-glass panels.",
        "A click-to-enter screen that starts a music player on shuffle.",
      ],
      role: LEAD,
      challenge:
        "Getting music to play at all. Browsers block audio until the visitor interacts with the page, which is why the site opens with a click-to-enter screen.",
    },
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
