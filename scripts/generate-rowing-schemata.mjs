import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const VIEWBOX = [0, 0, 2400, 560];
export const CENTER_Y = 280;

export const SINGLE_CONFIG = {
  viewBox: VIEWBOX,
  hull: { x: 620, length: 1160, maxWidth: 72 },
  seat: { seat: 1, x: 1200, y: CENTER_Y, mode: "scull", oars: ["PORT", "STARBOARD"] },
};

export const EIGHT_CONFIG = {
  viewBox: VIEWBOX,
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

export function hullHighlightPath(hull, centerY = CENTER_Y) {
  return hullPath(
    {
      x: hull.x + hull.length * 0.14,
      length: hull.length * 0.72,
      maxWidth: hull.maxWidth * 0.52,
    },
    centerY,
    28,
  );
}

function unitVector(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy);
  if (!d) throw new Error("points must differ");
  return { x: dx / d, y: dy / d };
}

function move(point, vector, distance) {
  return { x: point.x + vector.x * distance, y: point.y + vector.y * distance };
}

export function extendThroughPivot(handle, pivot, outboardLength) {
  const u = unitVector(handle, pivot);
  return move(pivot, u, outboardLength);
}

export function sweepGripGeometry(handleCenter, pivot, handSpacing = 10, innerExtension = 16) {
  const u = unitVector(handleCenter, pivot);
  const shaftStart = move(handleCenter, u, -innerExtension);
  const handA = move(handleCenter, u, -handSpacing / 2);
  const handB = move(handleCenter, u, handSpacing / 2);
  return { shaftStart, handA, handB };
}

export function bladePoints(pivot, root, length = 68, width = 26) {
  const u = unitVector(pivot, root);
  const px = -u.y;
  const py = u.x;
  const tip = move(root, u, length);
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
    .hull-highlight{stroke:none}
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

function oarMarkup({ id, shaftStart, pivot, outboard, bladeLength, bladeWidth }) {
  const root = extendThroughPivot(shaftStart, pivot, outboard);
  return `<g id="${id}">
    <line x1="${fmt(shaftStart.x)}" y1="${fmt(shaftStart.y)}" x2="${fmt(root.x)}" y2="${fmt(root.y)}" class="shaft"/>
    <polygon points="${bladePoints(pivot, root, bladeLength, bladeWidth)}" class="blade"/>
    <use href="#ae-oarlock" x="${fmt(pivot.x - 10)}" y="${fmt(pivot.y - 10)}" width="20" height="20"/>
  </g>`;
}

export function buildSingleScullSvg() {
  const { hull: hullConfig } = SINGLE_CONFIG;
  const hull = hullPath(hullConfig);
  const highlight = hullHighlightPath(hullConfig);
  const handlePort = { x: 1245, y: 300 };
  const handleStarboard = { x: 1245, y: 260 };
  const pivotPort = { x: 1200, y: 214 };
  const pivotStarboard = { x: 1200, y: 346 };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX.join(" ")}" role="img" aria-labelledby="title desc">
<title id="title">Einer 1x – technisches Ruderschema</title>
<desc id="desc">Direkte Draufsicht eines Renn-Einers mit einer Person und je einem Skull auf Backbord und Steuerbord.</desc>
${commonDefs()}
<g id="boat-1x">
  <path d="${hull}" fill="#F7F5EF" class="hull" filter="url(#ae-shadow-filter)"/>
  <path d="${highlight}" fill="#92D6EA" opacity=".24" class="hull-highlight"/>
  <g id="seat-1"><use href="#ae-seat" x="1182" y="268" width="36" height="24"/></g>
  <g id="foot-stretcher-1"><line x1="1145" y1="258" x2="1145" y2="302" class="foot"/></g>
  <g id="rigger-port-1" class="tech"><line x1="1175" y1="262" x2="1200" y2="214"/><line x1="1225" y1="262" x2="1200" y2="214"/></g>
  <g id="rigger-starboard-1" class="tech"><line x1="1175" y1="298" x2="1200" y2="346"/><line x1="1225" y1="298" x2="1200" y2="346"/></g>
  ${oarMarkup({ id: "scull-port-1", shaftStart: handlePort, pivot: pivotPort, outboard: 135, bladeLength: 68, bladeWidth: 26 })}
  ${oarMarkup({ id: "scull-starboard-1", shaftStart: handleStarboard, pivot: pivotStarboard, outboard: 135, bladeLength: 68, bladeWidth: 26 })}
  <g id="rower-1" filter="url(#ae-shadow-filter)">
    <use href="#ae-torso" x="1175" y="262" width="50" height="36"/>
    <use href="#ae-head" x="1217" y="267" width="26" height="26"/>
    <line x1="1207" y1="270" x2="1245" y2="260" class="arm"/>
    <line x1="1207" y1="290" x2="1245" y2="300" class="arm"/>
    <circle cx="1245" cy="260" r="6" class="hand"/>
    <circle cx="1245" cy="300" r="6" class="hand"/>
  </g>
</g>
</svg>`;
}

export function eightSeatGeometry({ side, x }) {
  const port = side === "PORT";
  const pivot = { x: x - 35, y: port ? 215 : 345 };
  const handleCenter = { x: x + 45, y: port ? 300 : 260 };
  const grip = sweepGripGeometry(handleCenter, pivot, 11, 17);
  return {
    port,
    pivot,
    handleCenter,
    ...grip,
    yAttach: port ? 258 : 302,
    sideId: side.toLowerCase(),
  };
}

function eightSeatMarkup({ seat, side, x }) {
  const geometry = eightSeatGeometry({ side, x });
  const { port, pivot, shaftStart, handA, handB, yAttach, sideId } = geometry;
  return `<g id="seat-${seat}"><use href="#ae-seat" x="${x - 18}" y="268" width="36" height="24"/></g>
  <g id="foot-stretcher-${seat}"><line x1="${x - 48}" y1="258" x2="${x - 48}" y2="302" class="foot"/></g>
  <g id="rigger-${sideId}-${seat}" class="tech"><line x1="${x - 26}" y1="${yAttach}" x2="${fmt(pivot.x)}" y2="${fmt(pivot.y)}"/><line x1="${x + 26}" y1="${yAttach}" x2="${fmt(pivot.x)}" y2="${fmt(pivot.y)}"/></g>
  ${oarMarkup({ id: `sweep-oar-${sideId}-${seat}`, shaftStart, pivot, outboard: 180, bladeLength: 76, bladeWidth: 30 })}
  <g id="rower-${seat}" filter="url(#ae-shadow-filter)">
    <use href="#ae-torso" x="${x - 25}" y="262" width="50" height="36"/>
    <use href="#ae-head" x="${x + 17}" y="267" width="26" height="26"/>
    <line x1="${x + 8}" y1="${port ? 271 : 289}" x2="${fmt(handA.x)}" y2="${fmt(handA.y)}" class="arm"/>
    <line x1="${x + 8}" y1="${port ? 289 : 271}" x2="${fmt(handB.x)}" y2="${fmt(handB.y)}" class="arm"/>
    <circle cx="${fmt(handA.x)}" cy="${fmt(handA.y)}" r="5.5" class="hand"/>
    <circle cx="${fmt(handB.x)}" cy="${fmt(handB.y)}" r="5.5" class="hand"/>
  </g>`;
}

export function buildEightSvg() {
  const { hull: hullConfig } = EIGHT_CONFIG;
  const hull = hullPath(hullConfig);
  const highlight = hullHighlightPath(hullConfig);
  const seats = EIGHT_CONFIG.seats.map(eightSeatMarkup).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX.join(" ")}" role="img" aria-labelledby="title desc">
<title id="title">Achter 8+ – technisches Ruderschema</title>
<desc id="desc">Direkte Draufsicht eines gesteuerten Rennachters mit acht Rudernden, einem Riemen pro Person, alternierenden Seiten und Steuerperson im Heck.</desc>
${commonDefs()}
<g id="boat-8plus">
  <path d="${hull}" fill="#92D6EA" class="hull" filter="url(#ae-shadow-filter)"/>
  <path d="${highlight}" fill="#FFFFFF" opacity=".18" class="hull-highlight"/>
  <g id="crew-and-riggers">
  ${seats}
    <g id="cox" filter="url(#ae-shadow-filter)">
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
  if (JSON.stringify(SINGLE_CONFIG.viewBox) !== JSON.stringify(EIGHT_CONFIG.viewBox)) {
    throw new Error("1x and 8+ must use the same production viewBox for display-scale consistency");
  }
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
