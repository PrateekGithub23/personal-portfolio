/**
 * Site-wide facts: identity, links and the short introductions used on the homepage and About page.
 * Sources: résumé (input/), candidate profile confirmed 2026-11-25. Edit here, not in components.
 */
export const site = {
  name: "Prateek Sharma",
  shortName: "Prateek",
  program: "Computer Engineering",
  school: "University of Waterloo",
  graduation: "April 2028",
  location: "Waterloo, Ontario",

  /** Used for <title> and the Open Graph card. */
  title: "Prateek Sharma, Computer Engineering at Waterloo",
  description:
    "Computer Engineering student at the University of Waterloo building backend, data and applied ML systems. Case studies with architecture, decisions and measured results.",

  /** Homepage opening paragraph. Plain statements about real work only. */
  lede: "I build backend and data software, and I measure whether it does what I say it does. Recent work: a routing engine that stays consistent while hazards change underneath it, and a security platform that checks every AI-written sentence against the logs it cites.",

  /** Second paragraph on the homepage: where I am now and what I'm looking for. */
  now: "Currently on a security co-op at TD. Open to co-op and full-time opportunities from summer 2027 onward, in software, backend and data engineering.",

  email: "ytprateek23@gmail.com",
  github: "https://github.com/PrateekGithub23",
  linkedin: "https://www.linkedin.com/in/prateek-s-a1117924b/",
  /** Built from input/resume.tex by `npm run resume:build` (phone number removed). */
  resume: "/resume/prateek-sharma-resume.pdf",
} as const;

/** Primary navigation. "Notes" is added automatically only when a note is published. */
export const nav = [
  { label: "Work", href: "/work" },
  { label: "Experience", href: "/experience" },
  { label: "About", href: "/about" },
  { label: "Beyond", href: "/beyond" },
] as const;
