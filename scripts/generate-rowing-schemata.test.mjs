import assert from "node:assert/strict";
import {
  EIGHT_CONFIG,
  SINGLE_CONFIG,
  buildEightSvg,
  buildSingleScullSvg,
  extendThroughPivot,
  validateConfigurations,
} from "./generate-rowing-schemata.mjs";

assert.equal(validateConfigurations(), true);

assert.deepEqual(
  EIGHT_CONFIG.seats.map(({ side }) => side),
  ["PORT", "STARBOARD", "PORT", "STARBOARD", "PORT", "STARBOARD", "PORT", "STARBOARD"],
);
assert.equal(EIGHT_CONFIG.seats.filter(({ side }) => side === "PORT").length, 4);
assert.equal(EIGHT_CONFIG.seats.filter(({ side }) => side === "STARBOARD").length, 4);
assert.equal(SINGLE_CONFIG.seat.oars.length, 2);

const single = buildSingleScullSvg();
const eight = buildEightSvg();

assert.equal((single.match(/id="scull-(?:port|starboard)-1"/g) || []).length, 2);
assert.equal((single.match(/id="rigger-(?:port|starboard)-1"/g) || []).length, 2);
assert.equal((single.match(/class="blade"/g) || []).length, 2);
assert.match(single, /viewBox="0 0 1600 560"/);

assert.equal((eight.match(/id="sweep-oar-(?:port|starboard)-\d+"/g) || []).length, 8);
assert.equal((eight.match(/id="rigger-(?:port|starboard)-\d+"/g) || []).length, 8);
assert.equal((eight.match(/id="rower-\d+"/g) || []).length, 8);
assert.equal((eight.match(/class="blade"/g) || []).length, 8);
assert.equal((eight.match(/id="cox"/g) || []).length, 1);
assert.match(eight, /viewBox="0 0 2400 560"/);

for (const { seat, side } of EIGHT_CONFIG.seats) {
  const other = side === "PORT" ? "starboard" : "port";
  assert.ok(!eight.includes(`id="rigger-${other}-${seat}"`), `seat ${seat} must not have a second rigger`);
}

const h = { x: 100, y: 100 };
const p = { x: 80, y: 40 };
const r = extendThroughPivot(h, p, 300);
const cross = (p.x - h.x) * (r.y - p.y) - (p.y - h.y) * (r.x - p.x);
assert.ok(Math.abs(cross) < 1e-9);

console.log("rowing schemata tests passed");
