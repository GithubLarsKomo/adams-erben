export function normalizeLocation(value = '') {
  return String(value)
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const values = [lat1, lon1, lat2, lon2].map(Number);
  if (!values.every(Number.isFinite)) return Number.POSITIVE_INFINITY;
  const [aLat, aLon, bLat, bLon] = values;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildPostalIndex(entries = []) {
  const byPostalCode = new Map();
  const byPlace = new Map();

  for (const entry of entries) {
    const postalCode = String(entry?.postalCode || '').trim();
    const latitude = Number(entry?.latitude);
    const longitude = Number(entry?.longitude);
    if (!/^\d{5}$/.test(postalCode) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    const normalized = { ...entry, postalCode, latitude, longitude };
    byPostalCode.set(postalCode, normalized);
    for (const place of Array.isArray(entry.places) ? entry.places : []) {
      const key = normalizeLocation(place);
      if (!key) continue;
      const list = byPlace.get(key) || [];
      list.push(normalized);
      byPlace.set(key, list);
    }
  }

  return { byPostalCode, byPlace };
}

function averagedOrigin(entries, label) {
  const valid = entries.filter((entry) => Number.isFinite(entry.latitude) && Number.isFinite(entry.longitude));
  if (!valid.length) return null;
  const latitude = valid.reduce((sum, entry) => sum + entry.latitude, 0) / valid.length;
  const longitude = valid.reduce((sum, entry) => sum + entry.longitude, 0) / valid.length;
  return { latitude, longitude, label };
}

export function resolveLocalLocation(query, index) {
  const raw = String(query || '').trim();
  const postalCode = raw.match(/\b(\d{5})\b/)?.[1];
  if (postalCode) {
    const entry = index?.byPostalCode?.get(postalCode);
    if (!entry) return null;
    const place = Array.isArray(entry.places) && entry.places[0] ? entry.places[0] : postalCode;
    return { latitude: entry.latitude, longitude: entry.longitude, label: `${postalCode} ${place}`.trim() };
  }

  const key = normalizeLocation(raw);
  if (!key) return null;
  const exact = index?.byPlace?.get(key) || [];
  if (exact.length) return averagedOrigin(exact, raw);

  const matches = [...(index?.byPlace?.entries?.() || [])]
    .filter(([place]) => place.startsWith(key))
    .slice(0, 2);
  if (matches.length !== 1) return null;
  return averagedOrigin(matches[0][1], matches[0][0]);
}

export function organizationCoordinates(org, postalIndex) {
  const latitude = Number(org?.latitude);
  const longitude = Number(org?.longitude);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) return { latitude, longitude };
  const postal = postalIndex?.byPostalCode?.get(String(org?.postalCode || '').trim());
  if (!postal) return null;
  return { latitude: postal.latitude, longitude: postal.longitude };
}

export function nearestClubs(organizations, origin, postalIndex, { radiusKm = Infinity, limit = 5 } = {}) {
  const radius = Number(radiusKm);
  const maxDistance = Number.isFinite(radius) ? radius : Infinity;
  return (Array.isArray(organizations) ? organizations : [])
    .filter((org) => org?.type === 'club')
    .map((org) => {
      const coordinates = organizationCoordinates(org, postalIndex);
      if (!coordinates) return null;
      const distanceKm = haversineKm(origin?.latitude, origin?.longitude, coordinates.latitude, coordinates.longitude);
      return Number.isFinite(distanceKm) ? { ...org, distanceKm } : null;
    })
    .filter(Boolean)
    .filter((org) => org.distanceKm <= maxDistance)
    .sort((a, b) => a.distanceKm - b.distanceKm || String(a.name).localeCompare(String(b.name), 'de'))
    .slice(0, Math.max(1, Number(limit) || 5));
}
