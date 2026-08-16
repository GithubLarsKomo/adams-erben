import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { applyLogoManifest, loadLogoManifest } from './lib/logo-manifest.mjs';

const root = process.cwd();
const clubsPath = path.join(root, 'dist', 'data', 'clubs.json');
const manifestPath = path.join(root, 'src', 'data', 'club-logos.json');

let clubs;
try {
  clubs = JSON.parse(await readFile(clubsPath, 'utf8'));
} catch (error) {
  if (error?.code === 'ENOENT') {
    console.warn('[logos] dist/data/clubs.json not found; logo manifest application skipped');
    process.exit(0);
  }
  throw error;
}

if (!Array.isArray(clubs.organizations)) throw new Error('dist/data/clubs.json does not contain organizations[]');

const manifest = await loadLogoManifest(manifestPath);
clubs.organizations = applyLogoManifest(clubs.organizations, manifest);
clubs.logoManifest = {
  version: manifest.version,
  generatedAt: manifest.generatedAt || '',
  localOnly: true
};
clubs.count = clubs.organizations.length;

await writeFile(clubsPath, `${JSON.stringify(clubs, null, 2)}\n`);
const withLogo = clubs.organizations.filter((organization) => organization.logoStatus === 'present').length;
console.log(`[logos] applied manifest: ${withLogo}/${clubs.organizations.length} organizations have local logos`);
