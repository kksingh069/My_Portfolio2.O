/* ════════════════════════════════════════════════════════════
   SITE CONTENT — edit everything here, the sections read from it.
   Replace the placeholder projects / links with your real ones.
   ════════════════════════════════════════════════════════════ */

export const SITE = {
  name: "Krishna Kant Singh",
  initials: "KKS",
  role: "Creative Developer",
  email: "kantkrishna542@gmail.com",
  location: "India",
  timezone: "Asia/Kolkata",
  available: true,
};

export const SOCIALS = [
  { label: "GitHub",   href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X / Twitter", href: "https://x.com/" },
  { label: "Dribbble", href: "https://dribbble.com/" },
];

export const NAV = [
  { label: "About",   target: "#about" },
  { label: "Work",    target: "#work" },
  { label: "Principles", target: "#principles" },
  { label: "Process", target: "#process" },
  { label: "Contact", target: "#contact" },
];

/* ── Capabilities (Mondragon-style staggered list) ─────────── */
export const CAPABILITIES = [
  {
    title: "Creative Development",
    note: "Ideas → shipped interactive products",
    tags: ["Next.js", "React", "TypeScript"],
    art: "orbit",
    indent: 0,
  },
  {
    title: "WebGL & 3D",
    note: "Shaders, particles, real-time scenes",
    tags: ["Three.js", "R3F", "GLSL"],
    art: "mesh",
    indent: 3,
  },
  {
    title: "Motion Design",
    note: "Scroll-driven stories that breathe",
    tags: ["GSAP", "Framer Motion", "Lenis"],
    art: "wave",
    indent: 1,
  },
  {
    title: "UI Engineering",
    note: "Pixel-true, accessible interfaces",
    tags: ["Tailwind", "Radix", "a11y"],
    art: "grid",
    indent: 4,
  },
  {
    title: "Design Systems",
    note: "Tokens, components, documentation",
    tags: ["Figma", "Storybook", "shadcn"],
    art: "blocks",
    indent: 2,
  },
  {
    title: "Performance",
    note: "90+ Lighthouse, 60fps, small bundles",
    tags: ["Core Web Vitals", "Edge", "SSR"],
    art: "pulse",
    indent: 5,
  },
];

/* ── Selected work (placeholder case studies — replace) ──────
   Add a project = add one object here. Every field below shows up
   in the card AND in the glass drawer that opens when it's clicked.

   cover:  "aether" | "monolith" | "pulse" | "drift"  (generated art)
   image:  optional — "/work/my-project.jpg" (put the file in /public/work)
           when set, the real image is used instead of the generated art
   live / code: URLs — leave "" to hide the button
   ───────────────────────────────────────────────────────────── */
export const PROJECTS = [
  {
    id: "aether",
    index: "01",
    title: "Aether",
    kind: "WebGL product launch",
    year: "2026",
    tags: ["Three.js", "GLSL", "GSAP"],
    cover: "aether",
    image: "",
    role: "Creative development, WebGL",
    duration: "8 weeks",
    summary:
      "A launch site for a concept audio product, built around a real-time 3D hero that reacts to sound and scroll. The goal: make people feel the product before they read a single spec.",
    highlights: [
      "Custom GLSL shader for the glowing core, tuned to stay at 60fps on mid-range phones",
      "Scroll-scrubbed camera path choreographed with GSAP ScrollTrigger",
      "Progressive loading — first paint under 1.5s, 3D streams in after",
    ],
    metrics: [
      { value: "60", unit: "fps", label: "on mobile" },
      { value: "1.4", unit: "s", label: "first paint" },
      { value: "98", unit: "", label: "Lighthouse" },
    ],
    live: "",
    code: "",
  },
  {
    id: "monolith",
    index: "02",
    title: "Monolith",
    kind: "Design system & docs",
    year: "2025",
    tags: ["React", "Storybook", "Tokens"],
    cover: "monolith",
    image: "",
    role: "Design system lead",
    duration: "4 months",
    summary:
      "A token-driven design system and documentation site that let a small team ship consistent UI across three products — one source of truth from Figma to code.",
    highlights: [
      "Design tokens synced from Figma to CSS variables automatically",
      "40+ accessible React components with Storybook docs",
      "Theming for light, dark and high-contrast out of the box",
    ],
    metrics: [
      { value: "40", unit: "+", label: "components" },
      { value: "3", unit: "", label: "products" },
      { value: "AA", unit: "", label: "WCAG" },
    ],
    live: "",
    code: "",
  },
  {
    id: "pulse",
    index: "03",
    title: "Pulse",
    kind: "Real-time analytics dashboard",
    year: "2025",
    tags: ["Next.js", "D3", "WebSockets"],
    cover: "pulse",
    image: "",
    role: "Frontend engineering, data viz",
    duration: "10 weeks",
    summary:
      "A live analytics dashboard that streams thousands of events per second into calm, readable charts — designed so the important change is the first thing you see.",
    highlights: [
      "WebSocket stream batched into smooth 60fps chart updates",
      "Custom D3 charts with animated transitions between states",
      "Keyboard-first navigation and screen-reader friendly data tables",
    ],
    metrics: [
      { value: "12k", unit: "", label: "events / s" },
      { value: "<100", unit: "ms", label: "latency" },
      { value: "6", unit: "", label: "chart types" },
    ],
    live: "",
    code: "",
  },
  {
    id: "drift",
    index: "04",
    title: "Drift",
    kind: "Motion-led e-commerce",
    year: "2024",
    tags: ["Shopify", "GSAP", "Lenis"],
    cover: "drift",
    image: "",
    role: "Design & development",
    duration: "6 weeks",
    summary:
      "A headless storefront where products float, tilt and settle as you scroll — motion used to guide the eye to what matters, not to decorate.",
    highlights: [
      "Floating 3D product shards with CSS 3D transforms — no WebGL needed",
      "Smooth inertial scrolling and page transitions between products",
      "Headless Shopify checkout with instant cart updates",
    ],
    metrics: [
      { value: "+32", unit: "%", label: "time on site" },
      { value: "0.9", unit: "s", label: "LCP" },
      { value: "4", unit: "", label: "weeks to launch" },
    ],
    live: "",
    code: "",
  },
];

/* ── Process (pinned horizontal scroll) ────────────────────── */
export const PROCESS = [
  {
    no: "01",
    title: "Discover",
    body: "I start with the why — goals, audience, constraints. Research and references become a sharp creative direction.",
    deliverables: ["Kick-off workshop", "Moodboards", "Tech audit"],
  },
  {
    no: "02",
    title: "Design",
    body: "Wireframes grow into high-fidelity screens and motion studies, so we feel the experience before we build it.",
    deliverables: ["UI design", "Motion prototypes", "Design tokens"],
  },
  {
    no: "03",
    title: "Engineer",
    body: "Clean, typed, component-driven code. Animation and WebGL tuned for 60fps on real devices, not just my laptop.",
    deliverables: ["Next.js build", "CMS setup", "QA on devices"],
  },
  {
    no: "04",
    title: "Launch",
    body: "SEO, analytics and performance budgets locked in. Then we ship — and I stay around to iterate.",
    deliverables: ["Deployment", "Lighthouse 90+", "Handover docs"],
  },
];

/* ── Swiss "Principles" section ──────────────────────────── */
export const PRINCIPLES = [
  { no: "01", title: "Clarity first", body: "If it needs explaining, it needs redesigning. Hierarchy, contrast and rhythm do the talking." },
  { no: "02", title: "Systems over screens", body: "Tokens, grids and components — so the hundredth page is as considered as the first." },
  { no: "03", title: "Motion with meaning", body: "Every animation answers a question: where did that come from, where should I look next?" },
  { no: "04", title: "Fast is a feature", body: "Beautiful is pointless at 4 seconds. Performance budgets are part of the design." },
];

/* ── Toolkit marquee ───────────────────────────────────────── */
export const TOOLKIT_A = ["Next.js", "React", "TypeScript", "GSAP", "Three.js", "GLSL", "Framer Motion"];
export const TOOLKIT_B = ["Tailwind", "Node.js", "Figma", "Blender", "WebGL", "Lenis", "Vercel"];
