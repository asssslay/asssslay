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

const ICON_BUTTONS = [
  { slug: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { slug: "telegram", label: "Telegram", icon: "telegram" },
];

const EXPERIENCE = [
  {
    slug: "upwork",
    gutter: "right",
    company: "Upwork",
    role: "Freelance Frontend Developer",
    dates: "Jun 2024 – Now",
    logo: "upwork.png",
    accent: ACCENT.pink,
    description: "Building responsive web interfaces with React and TypeScript, plus Framer and Webflow websites.",
  },
  {
    slug: "education",
    gutter: "left",
    company: "Odesa National Polytechnic University",
    role: "Computer Science · Degree with honors",
    dates: "2022 – 2026",
    logo: "onpu.png",
    logoFit: true,
    accent: ACCENT.lavender,
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

// `repo` cards pull their language from GitHub; the rest are static.
const PROJECTS = [
  {
    slug: "boogadee",
    gutter: "right",
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
    gutter: "left",
    repo: "kida-ui",
    logo: "kida-ui.svg",
    accent: ACCENT.pink,
    description:
      "Animation-first UI components, built to reach every stack: a framework-agnostic motion engine, shared CSS and React components.",
    pill: { label: "asssslay/kida-ui", icon: "github" },
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
  github: {
    fill: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  whatsapp: {
    fill: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
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

// Paired cards sit side by side at 50% width each; `gutter` adds transparent space on the
// inner edge so the pair gets a gap without the README relying on whitespace.
const GUTTER = 10;

function svgDoc({ width, height, label, body, gutter }) {
  const x = gutter === "left" ? -GUTTER : 0;
  const w = gutter ? width + GUTTER : width;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${height}" viewBox="${x} 0 ${w} ${height}" role="img" aria-label="${escapeXml(label)}">
  <style>text { font-family: ${FONT}; }</style>
  ${body}
</svg>
`;
}

// Charcoal card with a soft accent glow in the top-right corner.
function glowCard(width, height, accent, r = 0.75) {
  return `<defs>
    <radialGradient id="glow" cx="1" cy="0" r="${r}">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="${THEME.bg}" stroke="${THEME.border}"/>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="url(#glow)"/>`;
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
function experienceCardSvg({ company, role, dates, logo, logoFit, accent, description, gutter }) {
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
    gutter,
    body: `${glowCard(width, height, accent)}
  <defs><clipPath id="logo"><rect x="20" y="20" width="40" height="40" rx="10"/></clipPath></defs>
  ${logoSvg}
  <text x="74" y="36" font-size="16" font-weight="600" fill="${THEME.title}">${escapeXml(company)}</text>
  <text x="476" y="36" text-anchor="end" font-size="12" font-weight="600" fill="${accent}">${escapeXml(dates)}</text>
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
// Link pill; bold labels run ~10% wider than textWidth estimates.
function pill({ x, y, label, icon }) {
  const width = 40 + Math.round(textWidth(label, 12) * 1.1);
  const svg = `<rect x="${x}" y="${y}" width="${width}" height="24" rx="12" fill="${THEME.pill}"/>
  ${iconSvg(icon, { x: x + 10, y: y + 5, scale: 0.58, color: THEME.title, strokeWidth: 2.2 })}
  <text x="${x + 29}" y="${y + 16}" font-size="12" font-weight="600" fill="${THEME.title}">${escapeXml(label)}</text>`;
  return { svg, width };
}

function projectCardSvg({ name, logo, accent, meta, metaColor, description, pill: linkPill, note, gutter }) {
  const width = 496;
  const height = 168;
  const descSvg = wrapDescription(description)
    .map((line, i) => `<text x="20" y="${98 + i * 20}" font-size="13.5" fill="${THEME.body}">${escapeXml(line)}</text>`)
    .join("\n  ");
  const pillSvg = linkPill ? pill({ x: 20, y: 132, ...linkPill }).svg : "";
  const noteSvg = note
    ? `<text x="${width - 20}" y="148" text-anchor="end" font-size="12" font-weight="600" fill="${accent}">${escapeXml(note)}</text>`
    : "";
  return svgDoc({
    width,
    height,
    label: `${name}: ${description}`,
    gutter,
    body: `${glowCard(width, height, accent)}
  <defs><clipPath id="logo"><rect x="20" y="20" width="48" height="48" rx="12"/></clipPath></defs>
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
  const [merged, image] = await Promise.all([
    gh(`search/issues?q=${encodeURIComponent(`repo:${owner}/${repo} author:${OWNER} is:pr is:merged`)}`).then(
      (prs) => prs.total_count
    ),
    logo ? logoDataUri(logo) : avatarDataUri(owner),
  ]);
  return { fullName: `${owner}/${repo}`, merged, image, wide };
}

function contributionCardSvg({ fullName, merged, image, wide }) {
  const [owner, repo] = fullName.split("/");
  const width = wide ? 482 : 320;
  const height = 72;
  const prLabel = `${merged} merged PR${merged === 1 ? "" : "s"}`;
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
  <text x="84" y="53" font-size="12" fill="${THEME.title}">${prLabel}</text>`,
  });
}

/* ---------- Contribution activity banner ---------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

async function graphql(query, variables) {
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required for the contribution calendar");
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, "User-Agent": "profile-card-generator" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`graphql: ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  return json.data;
}

async function fetchActivity() {
  const [data, commits, mergedPrs] = await Promise.all([
    graphql(
      `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date weekday contributionCount } } } } } }`,
      { login: OWNER }
    ),
    gh(`search/commits?q=${encodeURIComponent(`author:${OWNER}`)}`).then((r) => r.total_count),
    gh(`search/issues?q=${encodeURIComponent(`author:${OWNER} type:pr is:merged`)}`).then((r) => r.total_count),
  ]);
  const calendar = data.user.contributionsCollection.contributionCalendar;
  return { total: calendar.totalContributions, weeks: calendar.weeks.map((w) => w.contributionDays), commits, mergedPrs };
}

function mix(from, to, amount) {
  const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [a, b] = [channels(from), channels(to)];
  return "#" + a.map((c, i) => Math.round(c + (b[i] - c) * amount).toString(16).padStart(2, "0")).join("");
}

const LEVEL_COLORS = [THEME.pill, ...[0.3, 0.5, 0.75, 1].map((amount) => mix(THEME.bg, ACCENT.pink, amount))];

function activityBannerSvg({ total, weeks, commits, mergedPrs }) {
  const width = 1000;
  const height = 284;
  const step = 18;
  const cell = 14;
  const gridX = 25;
  const gridY = 112;
  const days = weeks.flat();

  // Quartiles of active days, so a few huge days don't wash out the rest of the year.
  const active = days.map((d) => d.contributionCount).filter(Boolean).sort((a, b) => a - b);
  const quartile = (q) => active[Math.floor((active.length - 1) * q)] ?? 0;
  const thresholds = [quartile(0.25), quartile(0.5), quartile(0.75)];
  const level = (count) => (count === 0 ? 0 : 1 + thresholds.filter((t) => count > t).length);

  const cells = weeks
    .flatMap((week, col) =>
      week.map(
        (day) =>
          `<rect x="${gridX + col * step}" y="${gridY + day.weekday * step}" width="${cell}" height="${cell}" rx="3" fill="${LEVEL_COLORS[level(day.contributionCount)]}"/>`
      )
    )
    .join("\n  ");

  let lastLabelCol = -3;
  let lastMonth = null;
  const monthLabels = weeks
    .map((week, col) => {
      const month = Number(week[0].date.slice(5, 7)) - 1;
      if (month === lastMonth) return "";
      lastMonth = month;
      if (col - lastLabelCol < 3) return "";
      lastLabelCol = col;
      return `<text x="${gridX + col * step}" y="${gridY - 10}" font-size="12" fill="${THEME.text}">${MONTHS[month]}</text>`;
    })
    .join("");

  const byMonth = new Map();
  for (const day of days) byMonth.set(day.date.slice(0, 7), (byMonth.get(day.date.slice(0, 7)) ?? 0) + day.contributionCount);
  const [peakKey, peakCount] = [...byMonth].sort((a, b) => b[1] - a[1])[0];
  const peakLabel = `${MONTH_NAMES[Number(peakKey.slice(5)) - 1]} ${peakKey.slice(0, 4)}`;

  const first = days[0].date;
  const last = days[days.length - 1].date;
  const range = `${MONTHS[Number(first.slice(5, 7)) - 1]} ${first.slice(0, 4)} – ${MONTHS[Number(last.slice(5, 7)) - 1]} ${last.slice(0, 4)}`;

  const stats = [
    { value: total, label: "contributions in the last year", color: ACCENT.pink },
    { value: commits, label: "commits" },
    { value: mergedPrs, label: "merged pull requests" },
    { value: active.length, label: "active days" },
  ];
  let statX = width - 24;
  const statsSvg = stats
    .reverse()
    .map(({ value, label, color }) => {
      const svg = `<text x="${statX}" y="48" text-anchor="end" font-size="26" font-weight="700" fill="${color ?? THEME.title}">${value.toLocaleString("en-US")}</text>
  <text x="${statX}" y="68" text-anchor="end" font-size="12" fill="${THEME.text}">${label}</text>`;
      statX -= Math.max(textWidth(label, 12), 72) + 36;
      return svg;
    })
    .join("\n  ");

  const legendX = width - 24 - 34 - 5 * 16;
  const legend = `<text x="${legendX - 8}" y="263" text-anchor="end" font-size="12" fill="${THEME.text}">Less</text>
  ${LEVEL_COLORS.map((color, i) => `<rect x="${legendX + i * 16}" y="252" width="12" height="12" rx="3" fill="${color}"/>`).join("")}
  <text x="${width - 24}" y="263" text-anchor="end" font-size="12" fill="${THEME.text}">More</text>`;

  return svgDoc({
    width,
    height,
    label: `${total} contributions in the last year, ${commits} commits, ${mergedPrs} merged pull requests, ${active.length} active days. Most active in ${peakLabel}.`,
    body: `${glowCard(width, height, ACCENT.pink, 0.6)}
  <text x="24" y="44" font-size="18" font-weight="600" fill="${THEME.title}">Contribution activity</text>
  <text x="24" y="66" font-size="12" fill="${THEME.text}">${range}</text>
  ${statsSvg}
  ${monthLabels}
  ${cells}
  <circle cx="29" cy="258" r="4" fill="${ACCENT.pink}"/>
  <text x="40" y="263" font-size="12" fill="${THEME.body}">Most active in <tspan font-weight="600" fill="${THEME.title}">${peakLabel}</tspan> · ${peakCount.toLocaleString("en-US")} contributions</text>
  ${legend}`,
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

writeFileSync(`${outDir("activity")}banner.svg`, activityBannerSvg(await fetchActivity()));
console.log("Generated activity banner");
