// Regenerates every card in profile/: node profile/generate-profile.mjs
// Repo stats come from the GitHub API; set GITHUB_TOKEN to avoid rate limits.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

const OWNER = "asssslay";

const THEME = {
  bg: "#211E1E",
  title: "#CFCECD",
  body: "#8F8B8A",
  text: "#656363",
  border: "#3A3535",
  pill: "#2C2828",
};

// Pastel accents carried over from the pink redesign.
const ACCENT = { pink: "#F4C2D7", peach: "#F7C8A5", lavender: "#CEC4F4", onPink: "#30272B" };

const FONT = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const LINE_CHARS = 62;

const BUTTONS = [
  { slug: "contact", label: "Contact me", icon: "mail", primary: true },
  { slug: "portfolio", label: "Portfolio", icon: "globe" },
  { slug: "upwork", label: "Upwork", icon: "upwork" },
];

const ICON_BUTTONS = [{ slug: "telegram", label: "Telegram", icon: "telegram" }];

const EXPERIENCE = [
  {
    slug: "upwork",
    company: "Upwork",
    role: "Freelance Frontend Developer",
    dates: "Jun 2024 – Now",
    logo: "upwork.png",
    description: "Building responsive web interfaces with React and TypeScript, plus Framer and Webflow websites.",
  },
  {
    slug: "education",
    company: "Odesa National Polytechnic University",
    role: "Computer Science · Degree with honors",
    dates: "2022 – 2026",
    logo: "onpu.png",
    logoFit: true,
    description: "Computer Science degree with honors, plus additional courses in JavaScript, HTML and CSS.",
  },
];

const SKILLS = {
  typescript: { name: "TypeScript", icon: "typescript.svg" },
  react: { name: "React", icon: "react.svg" },
  tanstack: { name: "TanStack", icon: "tanstack.png" },
  tailwind: { name: "Tailwind CSS", icon: "tailwind.svg" },
  framer: { name: "Framer", icon: "framer.svg" },
  webflow: { name: "Webflow", icon: "webflow.svg" },
};

const FEATURED_STACK = ["typescript", "react", "tanstack", "tailwind", "framer", "webflow"];

// `repo` cards pull language and stars from GitHub; the rest are static.
const PROJECTS = [
  {
    slug: "boogadee",
    name: "Boogadee",
    logo: "boogadee.svg",
    accent: ACCENT.peach,
    meta: "Next.js · Supabase · Leaflet",
    description: "Childcare search and waitlist platform for families and providers, built with React, TypeScript and Tailwind CSS.",
    pill: { label: "boogadee.com", icon: "globe" },
    note: "Live website",
  },
  {
    slug: "kida-ui",
    repo: "kida-ui",
    logo: "kida-ui.svg",
    accent: ACCENT.pink,
    description:
      "Animation-first UI components, built to reach every stack: a framework-agnostic motion engine, shared CSS and React components.",
    note: "Open source · pre-alpha",
  },
];

const CONTRIBUTIONS = [{ owner: "Emanuele-web04", repo: "synara", logo: "synara.png", wide: true }];

const LANG_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const MERGE_PATHS = `<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>`;

// 24px icons: lucide strokes, simple-icons fills.
const ICONS = {
  mail: { stroke: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>` },
  globe: {
    stroke: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
  },
  upwork: {
    fill: "M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z",
  },
  telegram: {
    fill: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024q-.159.037-5.061 3.345q-.72.495-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789q.04-.324.893-.663q5.247-2.286 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635",
  },
};

function iconSvg(name, { x, y, scale, color, strokeWidth = 2 }) {
  const icon = ICONS[name];
  if (icon.fill) return `<path transform="translate(${x},${y}) scale(${scale})" fill="${color}" d="${icon.fill}"/>`;
  return `<g transform="translate(${x},${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${icon.stroke}</g>`;
}

const escapeXml = (s) =>
  s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]
  );

function wrapDescription(text) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > LINE_CHARS) {
      if (line) lines.push(line.trim());
      line = word;
      if (lines.length === 2) break;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (lines.length < 2 && line) lines.push(line.trim());
  if (lines.length === 2) {
    const joined = lines.join(" ");
    if (joined.length > text.length) return lines;
    if (words.join(" ").length > joined.length) lines[1] = lines[1] + "…";
  }
  return lines.slice(0, 2);
}

function formatCount(n) {
  if (n >= 1000) {
    const k = n / 1000;
    return (k >= 10 ? Math.round(k) : Math.round(k * 10) / 10) + "k";
  }
  return String(n);
}

// Rough glyph widths for the UI font at 1px; textLength then pins the label to this width.
function textWidth(text, size) {
  let units = 0;
  for (const c of text) {
    if ("iljtf.,/' ".includes(c)) units += 0.3;
    else if ("rI".includes(c)) units += 0.38;
    else if (c >= "A" && c <= "Z") units += 0.66;
    else units += 0.56;
  }
  return Math.round(units * size);
}

const MIME = { ".svg": "image/svg+xml", ".png": "image/png" };

function assetDataUri(file) {
  const path = fileURLToPath(new URL(`../assets/${file}`, import.meta.url));
  return `data:${MIME[extname(file)]};base64,${readFileSync(path).toString("base64")}`;
}

const logoDataUri = (file) => assetDataUri(`logos/${file}`);

function svgDoc({ width, height, label, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
  <style>text { font-family: ${FONT}; }</style>
  ${body}
</svg>
`;
}

/* ---------- Header buttons ---------- */
function buttonSvg({ label, icon, primary }) {
  const labelWidth = textWidth(label, 14);
  const width = 40 + labelWidth + 16;
  const fill = primary ? ACCENT.pink : THEME.bg;
  const ink = primary ? ACCENT.onPink : THEME.title;
  const stroke = primary ? "" : ` stroke="${THEME.border}"`;
  return svgDoc({
    width,
    height: 36,
    label,
    body: `<rect x="0.5" y="0.5" width="${width - 1}" height="35" rx="8" fill="${fill}"${stroke}/>
  ${iconSvg(icon, { x: 16, y: 10, scale: 0.667, color: ink })}
  <text x="40" y="23" font-size="14" font-weight="500" fill="${ink}" textLength="${labelWidth}" lengthAdjust="spacing">${escapeXml(label)}</text>`,
  });
}

function iconButtonSvg({ label, icon }) {
  return svgDoc({
    width: 36,
    height: 36,
    label,
    body: `<rect x="0.5" y="0.5" width="35" height="35" rx="8" fill="${THEME.bg}" stroke="${THEME.border}"/>
  ${iconSvg(icon, { x: 10, y: 10, scale: 0.667, color: THEME.title })}`,
  });
}

const DIVIDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="36" viewBox="0 0 9 36" aria-hidden="true"><rect x="4" y="8" width="1" height="20" fill="${THEME.border}"/></svg>
`;

/* ---------- Experience ---------- */
function experienceCardSvg({ company, role, dates, logo, logoFit, description }) {
  const width = 496;
  const height = 124;
  const descSvg = wrapDescription(description)
    .map((line, i) => `<text x="20" y="${92 + i * 19}" font-size="13" fill="${THEME.body}">${escapeXml(line)}</text>`)
    .join("\n  ");
  // Crest-shaped logos keep their outline instead of being cropped to a tile.
  const logoSvg = logoFit
    ? `<image href="${logoDataUri(logo)}" x="20" y="20" width="40" height="40" preserveAspectRatio="xMidYMid meet"/>`
    : `<image href="${logoDataUri(logo)}" x="20" y="20" width="40" height="40" clip-path="url(#logo)"/>`;
  return svgDoc({
    width,
    height,
    label: `${role} at ${company}, ${dates}`,
    body: `<defs><clipPath id="logo"><rect x="20" y="20" width="40" height="40" rx="10"/></clipPath></defs>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="${THEME.bg}" stroke="${THEME.border}"/>
  ${logoSvg}
  <text x="74" y="36" font-size="16" font-weight="600" fill="${THEME.title}">${escapeXml(company)}</text>
  <text x="476" y="36" text-anchor="end" font-size="12" fill="${THEME.text}">${escapeXml(dates)}</text>
  <text x="74" y="56" font-size="13" fill="${THEME.body}">${escapeXml(role)}</text>
  ${descSvg}`,
  });
}

/* ---------- Tech stack ---------- */
function stackChip(x, y, key, { height, iconSize, fontSize }) {
  const { name, icon } = SKILLS[key];
  const pad = (height - iconSize) / 2 + 2;
  const labelWidth = textWidth(name, fontSize);
  const width = pad + iconSize + 8 + labelWidth + pad + 2;
  const svg = `<rect x="${x + 0.5}" y="${y + 0.5}" width="${width - 1}" height="${height - 1}" rx="8" fill="${THEME.bg}" stroke="${THEME.border}"/>
  <image href="${assetDataUri(`stack/${icon}`)}" x="${x + pad}" y="${y + (height - iconSize) / 2}" width="${iconSize}" height="${iconSize}"/>
  <text x="${x + pad + iconSize + 8}" y="${y + height / 2 + fontSize * 0.35}" font-size="${fontSize}" font-weight="500" fill="${THEME.title}" textLength="${labelWidth}" lengthAdjust="spacing">${escapeXml(name)}</text>`;
  return { svg, width };
}

function featuredStackSvg() {
  const size = { height: 40, iconSize: 20, fontSize: 14 };
  let x = 0;
  const chips = FEATURED_STACK.map((key) => {
    const chip = stackChip(x, 0, key, size);
    x += chip.width + 8;
    return chip.svg;
  });
  return svgDoc({
    width: x - 8,
    height: size.height,
    label: `Main stack: ${FEATURED_STACK.map((key) => SKILLS[key].name).join(", ")}`,
    body: chips.join("\n  "),
  });
}

/* ---------- Project cards ---------- */
// Stat pill; sized from a generous per-character width so bold digits never overlap.
function pill({ x, y, label, icon }) {
  const width = 38 + label.length * 7.6;
  const svg = `<rect x="${x}" y="${y}" width="${width}" height="24" rx="12" fill="${THEME.pill}"/>
  ${icon}
  <text x="${x + 29}" y="${y + 16}" font-size="12" font-weight="600" fill="${THEME.title}">${escapeXml(label)}</text>`;
  return { svg, width };
}

const starIcon = (x, y, color) =>
  `<g transform="translate(${x},${y}) scale(0.58)" fill="${color}" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"><path d="${STAR_PATH}"/></g>`;

function projectCardSvg({ name, logo, accent, meta, metaColor, description, stars, pill: linkPill, note }) {
  const width = 496;
  const height = 168;
  const descSvg = wrapDescription(description)
    .map((line, i) => `<text x="20" y="${98 + i * 20}" font-size="13.5" fill="${THEME.body}">${escapeXml(line)}</text>`)
    .join("\n  ");
  const pillSvg =
    stars !== undefined
      ? pill({ x: 20, y: 132, label: formatCount(stars), icon: starIcon(30, 137, accent) }).svg
      : linkPill
        ? pill({
            x: 20,
            y: 132,
            label: linkPill.label,
            icon: iconSvg(linkPill.icon, { x: 30, y: 137, scale: 0.58, color: THEME.title, strokeWidth: 2.2 }),
          }).svg
        : "";
  const noteSvg = note
    ? `<text x="${width - 20}" y="148" text-anchor="end" font-size="12" font-weight="600" fill="${accent}">${escapeXml(note)}</text>`
    : "";
  return svgDoc({
    width,
    height,
    label: `${name}: ${description}`,
    body: `<defs>
    <radialGradient id="glow" cx="1" cy="0" r="0.75">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="logo"><rect x="20" y="20" width="48" height="48" rx="12"/></clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="${THEME.bg}" stroke="${THEME.border}"/>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="url(#glow)"/>
  <image href="${logoDataUri(logo)}" x="20" y="20" width="48" height="48" clip-path="url(#logo)"/>
  <text x="82" y="41" font-size="20" font-weight="600" fill="${THEME.title}">${escapeXml(name)}</text>
  ${meta ? `<circle cx="86" cy="58" r="4" fill="${metaColor ?? accent}"/>
  <text x="96" y="62" font-size="12" fill="${THEME.text}">${escapeXml(meta)}</text>` : ""}
  ${descSvg}
  ${pillSvg}
  ${noteSvg}`,
  });
}

async function gh(path) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "profile-card-generator" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function resolveProject(project) {
  if (!project.repo) return project;
  const data = await gh(`repos/${OWNER}/${project.repo}`);
  return {
    ...project,
    name: data.name,
    description: project.description ?? data.description ?? "",
    meta: data.language ?? "",
    metaColor: LANG_COLORS[data.language] ?? "#8b949e",
    stars: data.stargazers_count,
  };
}

/* ---------- Contribution cards ---------- */
async function avatarDataUri(owner) {
  const res = await fetch(`https://github.com/${owner}.png?size=80`);
  if (!res.ok) throw new Error(`${owner} avatar: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${res.headers.get("content-type")};base64,${buf.toString("base64")}`;
}

async function fetchContribution({ owner, repo, logo, wide = false }) {
  const [data, merged, image] = await Promise.all([
    gh(`repos/${owner}/${repo}`),
    gh(`search/issues?q=${encodeURIComponent(`repo:${owner}/${repo} author:${OWNER} is:pr is:merged`)}`).then(
      (prs) => prs.total_count
    ),
    logo ? logoDataUri(logo) : avatarDataUri(owner),
  ]);
  return { fullName: data.full_name, stars: data.stargazers_count, merged, image, wide };
}

function contributionCardSvg({ fullName, stars, merged, image, wide }) {
  const [owner, repo] = fullName.split("/");
  const width = wide ? 482 : 320;
  const height = 72;
  const prLabel = `${merged} merged PR${merged === 1 ? "" : "s"}`;
  const starsX = 84 + prLabel.length * 6.6 + 14;
  return svgDoc({
    width,
    height,
    label: `${fullName}: ${prLabel}`,
    body: `<defs><clipPath id="logo"><rect x="16" y="16" width="40" height="40" rx="8"/></clipPath></defs>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${THEME.bg}" stroke="${THEME.border}"/>
  <rect x="0.5" y="18" width="3" height="${height - 36}" rx="1.5" fill="${ACCENT.pink}"/>
  <image href="${image}" x="16" y="16" width="40" height="40" clip-path="url(#logo)"/>
  <text x="68" y="33" font-size="15"><tspan fill="${THEME.text}">${escapeXml(owner)}/</tspan><tspan font-weight="600" fill="${THEME.title}">${escapeXml(repo)}</tspan></text>
  <g transform="translate(68,43) scale(0.5)" fill="none" stroke="${ACCENT.pink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${MERGE_PATHS}</g>
  <text x="84" y="53" font-size="12" fill="${THEME.title}">${prLabel}</text>
  <text x="${starsX}" y="53" font-size="12" fill="${THEME.text}">★ ${formatCount(stars)}</text>`,
  });
}

/* ---------- Write ---------- */
function outDir(name) {
  const dir = fileURLToPath(new URL(`./${name}/`, import.meta.url));
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  return dir;
}

const buttonsDir = outDir("buttons");
for (const button of BUTTONS) writeFileSync(`${buttonsDir}${button.slug}.svg`, buttonSvg(button));
for (const button of ICON_BUTTONS) writeFileSync(`${buttonsDir}${button.slug}.svg`, iconButtonSvg(button));
writeFileSync(`${buttonsDir}divider.svg`, DIVIDER_SVG);
console.log(`Generated ${BUTTONS.length + ICON_BUTTONS.length} buttons`);

writeFileSync(`${outDir("stack")}featured.svg`, featuredStackSvg());
console.log("Generated stack row");

const experienceDir = outDir("experience");
for (const job of EXPERIENCE) writeFileSync(`${experienceDir}${job.slug}.svg`, experienceCardSvg(job));
console.log(`Generated ${EXPERIENCE.length} experience cards`);

const projects = await Promise.all(PROJECTS.map(resolveProject));
const projectsDir = outDir("projects");
for (const project of projects) writeFileSync(`${projectsDir}${project.slug}.svg`, projectCardSvg(project));
console.log(`Generated ${projects.length} project cards`);

const contributions = await Promise.all(CONTRIBUTIONS.map(fetchContribution));
const contribDir = outDir("contrib");
for (const data of contributions) {
  writeFileSync(contribDir + data.fullName.toLowerCase().replace("/", "-") + ".svg", contributionCardSvg(data));
}
console.log(`Generated ${contributions.length} contribution cards`);
