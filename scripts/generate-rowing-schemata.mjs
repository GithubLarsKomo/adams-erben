import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const CENTER_Y = 280;

export const SINGLE_CONFIG = {
  viewBox: [0, 0, 1600, 560],
  hull: { x: 220, length: 1160, maxWidth: 72 },
  seat: { seat: 1, x: 800, y: CENTER_Y, mode: "scull", oars: ["PORT", "STARBOARD"] },
};

export const EIGHT_CONFIG = {
  viewBox: [0, 0, 2400, 560],
  hull: { x: 210, length: 1980, maxWidth: 88 },
  seats: [
    { seat: 1, side: "PORT", x: 500 },
    { seat: 2, side: "STARBOARD", x: 680 },
    { seat: 3, side: "PORT", x: 860 },
    { seat: 4, side: "STARBOARD", x: 1040 },
    { seat: 5, side: "PORT", x: 1220 },
    { seat: 6, side: "STARBOARD", x: 1400 },
    { seat: 7, side: "PORT", x: 1580 },
    { seat: 8, side: "STARBOARD", x: 1760 },
  ],
  coxX: 1970,
};

const fmt = (n) => Number(n.toFixed(2)).toString();

export function hullPath({ x, length, maxWidth }, centerY = CENTER_Y, stations = 40) {
  const top = [];
  const bottom = [];
  for (let i = 0; i <= stations; i += 1) {
    const u = i / stations;
    const width = i === 0 || i === stations ? 0 : maxWidth * Math.sin(Math.PI * u) ** 0.72;
    const px = x + u * length;
    top.push([px, centerY - width / 2]);
    bottom.push([px, centerY + width / 2]);
  }
  const points = [...top, ...bottom.reverse()];
  return `M ${points.map(([px, py]) => `${fmt(px)} ${fmt(py)}`).join(" L ")} Z`;
}

export function extendThroughPivot(handle, pivot, outboardLength) {
  const dx = pivot.x - handle.x;
  const dy = pivot.y - handle.y;
  const d = Math.hypot(dx, dy);
  if (!d) throw new Error("handle and pivot must differ");
  const ux = dx / d;
  const uy = dy / d;
  return { x: pivot.x + ux * outboardLength, y: pivot.y + uy * outboardLength };
}

export function bladePoints(pivot, root, length = 68, width = 26) {
  const dx = root.x - pivot.x;
  const dy = root.y - pivot.y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const px = -uy;
  const py = ux;
  const tip = { x: root.x + ux * length, y: root.y + uy * length };
  const pts = [
    { x: root.x + px * width * 0.22, y: root.y + py * width * 0.22 },
    { x: tip.x + px * width * 0.5, y: tip.y + py * width * 0.5 },
    { x: tip.x - px * width * 0.5, y: tip.y - py * width * 0.5 },
    { x: root.x - px * width * 0.22, y: root.y - py * width * 0.22 },
  ];
  return pts.map(({ x, y }) => `${fmt(x)},${fmt(y)}`).join(" ");
}

function commonDefs() {
  return `<defs>
  <style>
    .hull{stroke:#0B2336;stroke-width:4;stroke-linejoin:round}
    .tech{stroke:#0B2336;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;fill:none}
    .shaft{stroke:#123A57;stroke-width:6;stroke-linecap:round}
    .seat{fill:#123A57;stroke:#0B2336;stroke-width:3}
    .foot{stroke:#0B2336;stroke-width:5;stroke-linecap:round}
    .rower{fill:#F7F5EF;stroke:#0B2336;stroke-width:3}
    .head{fill:#A9DCEB;stroke:#0B2336;stroke-width:3}
    .arm{stroke:#0B2336;stroke-width:8;stroke-linecap:round}
    .hand{fill:#A6342B;stroke:#0B2336;stroke-width:2}
    .oarlock{fill:#92D6EA;stroke:#0B2336;stroke-width:3}
    .blade{fill:#A6342B;stroke:#0B2336;stroke-width:3;stroke-linejoin:round}
  </style>
  <filter id="ae-shadow-filter" x="-20%" y="-30%" width="140%" height="160%">
    <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0B2336" flood-opacity="0.16"/>
  </filter>
  <symbol id="ae-seat" viewBox="-18 -12 36 24"><rect x="-18" y="-12" width="36" height="24" rx="6" class="seat"/></symbol>
  <symbol id="ae-oarlock" viewBox="-10 -10 20 20"><circle r="8" class="oarlock"/><circle r="2.6" fill="#0B2336"/></symbol>
  <symbol id="ae-head" viewBox="-13 -13 26 26"><circle r="12" class="head"/></symbol>
  <symbol id="ae-torso" viewBox="-25 -18 50 36"><rect x="-24" y="-17" width="48" height="34" rx="15" class="rower"/></symbol>
</defs>`;
}

function oarMarkup({ id, handle, pivot, outboard, bladeLength, bladeWidth }) {
  const root = extendThroughPivot(handle, pivot, outboard);
  return `<g id="${id}">
    <line x1="${fmt(handle.x)}" y1="${fmt(handle.y)}" x2="${fmt(root.x)}" y2="${fmt(root.y)}" class="shaft"/>
    <polygon points="${bladePoints(pivot, root, bladeLength, bladeWidth)}" class="blade"/>
    <use href="#ae-oarlock" x="${fmt(pivot.x - 10)}" y="${fmt(pivot.y - 10)}" width="20" height="20"/>
  </g>`;
}

export function buildSingleScullSvg() {
  const hull = hullPath(SINGLE_CONFIG.hull);
  const handlePort = { x: 845, y: 300 };
  const handleStarboard = { x: 845, y: 260 };
  const pivotPort = { x: 800, y: 214 };
  const pivotStarboard = { x: 800, y: 346 };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 560" role="img" aria-labelledby="title desc">
<title id="title">Einer 1x – technisches Ruderschema</title>
<desc id="desc">Direkte Draufsicht eines Renn-Einers mit einer Person und je einem Skull auf Backbord und Steuerbord.</desc>
${commonDefs()}
<g id="boat-1x">
  <path d="${hull}" fill="#F7F5EF" class="hull" filter="url(#ae-shadow-filter)"/>
  <path d="M 650 280 C 700 252 900 252 950 280 C 900 308 700 308 650 280 Z" fill="#92D6EA" opacity=".24"/>
  <g id="seat-1"><use href="#ae-seat" x="782" y="268" width="36" height="24"/></g>
  <g id="foot-stretcher-1"><line x1="745" y1="258" x2="745" y2="302" class="foot"/></g>
  <g id="rigger-port-1" class="tech"><line x1="775" y1="262" x2="800" y2="214"/><line x1="825" y1="262" x2="800" y2="214"/></g>
  <g id="rigger-starboard-1" class="tech"><line x1="775" y1="298" x2="800" y2="346"/><line x1="825" y1="298" x2="800" y2="346"/></g>
  ${oarMarkup({ id: "scull-port-1", handle: handlePort, pivot: pivotPort, outboard: 145, bladeLength: 68, bladeWidth: 26 })}
  ${oarMarkup({ id: "scull-starboard-1", handle: handleStarboard, pivot: pivotStarboard, outboard: 145, bladeLength: 68, bladeWidth: 26 })}
  <g id="rower-1" filter="url(#ae-shadow-filter)">
    <use href="#ae-torso" x="775" y="262" width="50" height="36"/>
    <use href="#ae-head" x="817" y="267" width="26" height="26"/>
    <line x1="807" y1="270" x2="845" y2="260" class="arm"/>
    <line x1="807" y1="290" x2="845" y2="300" class="arm"/>
    <circle cx="845" cy="260" r="6" class="hand"/>
    <circle cx="845" cy="300" r="6" class="hand"/>
  </g>
</g>
</svg>`;
}

function eightSeatMarkup({ seat, side, x }) {
  const port = side === "PORT";
  const pivot = { x, y: port ? 205 : 355 };
  const handle = { x: x + 38, y: port ? 307 : 253 };
  const yAttach = port ? 258 : 302;
  const sideId = side.toLowerCase();
  const handA = { x: handle.x - 5, y: handle.y + (port ? -4 : 4) };
  const handB = { x: handle.x + 5, y: handle.y + (port ? 4 : -4) };
  return `<g id="seat-${seat}"><use href="#ae-seat" x="${x - 18}" y="268" width="36" height="24"/></g>
  <g id="foot-stretcher-${seat}"><line x1="${x - 48}" y1="258" x2="${x - 48}" y2="302" class="foot"/></g>
  <g id="rigger-${sideId}-${seat}" class="tech"><line x1="${x - 26}" y1="${yAttach}" x2="${pivot.x}" y2="${pivot.y}"/><line x1="${x + 26}" y1="${yAttach}" x2="${pivot.x}" y2="${pivot.y}"/></g>
  ${oarMarkup({ id: `sweep-oar-${sideId}-${seat}`, handle, pivot, outboard: 130, bladeLength: 76, bladeWidth: 30 })}
  <g id="rower-${seat}">
    <use href="#ae-torso" x="${x - 25}" y="262" width="50" height="36"/>
    <use href="#ae-head" x="${x + 17}" y="267" width="26" height="26"/>
    <line x1="${x + 8}" y1="${port ? 271 : 289}" x2="${fmt(handA.x)}" y2="${fmt(handA.y)}" class="arm"/>
    <line x1="${x + 8}" y1="${port ? 289 : 271}" x2="${fmt(handB.x)}" y2="${fmt(handB.y)}" class="arm"/>
    <circle cx="${fmt(handA.x)}" cy="${fmt(handA.y)}" r="5.5" class="hand"/>
    <circle cx="${fmt(handB.x)}" cy="${fmt(handB.y)}" r="5.5" class="hand"/>
  </g>`;
}

export function buildEightSvg() {
  const hull = hullPath(EIGHT_CONFIG.hull);
  const seats = EIGHT_CONFIG.seats.map(eightSeatMarkup).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 560" role="img" aria-labelledby="title desc">
<title id="title">Achter 8+ – technisches Ruderschema</title>
<desc id="desc">Direkte Draufsicht eines gesteuerten Rennachters mit acht Rudernden, einem Riemen pro Person, alternierenden Seiten und Steuerperson im Heck.</desc>
${commonDefs()}
<g id="boat-8plus">
  <path d="${hull}" fill="#92D6EA" class="hull" filter="url(#ae-shadow-filter)"/>
  <path d="M 400 280 C 520 246 1880 246 2000 280 C 1880 314 520 314 400 280 Z" fill="#FFFFFF" opacity=".18"/>
  <g id="crew-and-riggers" filter="url(#ae-shadow-filter)">
  ${seats}
    <g id="cox">
      <use href="#ae-torso" x="1945" y="264" width="44" height="32"/>
      <use href="#ae-head" x="1982" y="267" width="26" height="26"/>
    </g>
  </g>
</g>
</svg>`;
}

export function validateConfigurations() {
  const sides = EIGHT_CONFIG.seats.map(({ side }) => side);
  const expected = ["PORT", "STARBOARD", "PORT", "STARBOARD", "PORT", "STARBOARD", "PORT", "STARBOARD"];
  if (JSON.stringify(sides) !== JSON.stringify(expected)) {
    throw new Error(`8+ side sequence invalid: ${sides.join(", ")}`);
  }
  if (EIGHT_CONFIG.seats.length !== 8) throw new Error("8+ must have exactly eight rowing seats");
  if (new Set(EIGHT_CONFIG.seats.map(({ seat }) => seat)).size !== 8) throw new Error("8+ seat numbers must be unique");
  if (SINGLE_CONFIG.seat.oars.length !== 2) throw new Error("1x must have exactly two sculls");
  return true;
}

export function generateRowingSchemata(outputDir) {
  validateConfigurations();
  fs.mkdirSync(outputDir, { recursive: true });
  const singlePath = path.join(outputDir, "rowing-schema-1x.svg");
  const eightPath = path.join(outputDir, "rowing-schema-8plus.svg");
  fs.writeFileSync(singlePath, buildSingleScullSvg(), "utf8");
  fs.writeFileSync(eightPath, buildEightSvg(), "utf8");
  return { singlePath, eightPath };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const outputDir = path.join(repoRoot, "src", "assets", "images");
  const result = generateRowingSchemata(outputDir);
  console.log(`[rowing-schemata] wrote ${result.singlePath}`);
  console.log(`[rowing-schemata] wrote ${result.eightPath}`);
}
