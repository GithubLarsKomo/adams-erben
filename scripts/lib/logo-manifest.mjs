import { readFile } from 'node:fs/promises';

export async function loadLogoManifest(filePath) {
  try {
    const raw = JSON.parse(await readFile(filePath, 'utf8'));
    return {
      version: Number(raw.version || 1),
      generatedAt: raw.generatedAt || '',
      organizations: raw.organizations && typeof raw.organizations === 'object' ? raw.organizations : {}
    };
  } catch (error) {
    if (error?.code === 'ENOENT') return { version: 1, generatedAt: '', organizations: {} };
    throw error;
  }
}

export function logoEntryForOrganization(organization, manifest) {
  const entries = manifest?.organizations || {};
  const keys = [organization.organizationId, organization.id, organization.drvId].filter(Boolean).map(String);
  for (const key of keys) {
    const entry = entries[key];
    if (entry?.status === 'present' && entry.asset) return entry;
  }
  return null;
}

export function applyLogoManifest(organizations, manifest) {
  return organizations.map((organization) => {
    const entry = logoEntryForOrganization(organization, manifest);
    if (!entry) return {
      ...organization,
      logo: '',
      logoStatus: 'missing'
    };
    return {
      ...organization,
      logo: entry.asset,
      logoStatus: 'present',
      logoSourceUrl: entry.sourceUrl || '',
      logoSourcePage: entry.sourcePage || organization.website || ''
    };
  });
}
