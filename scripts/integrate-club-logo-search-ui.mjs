import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const appPath = path.join(root, 'src', 'assets', 'app.js');
const stylesPath = path.join(root, 'src', 'assets', 'styles.css');

let app = await readFile(appPath, 'utf8');
let styles = await readFile(stylesPath, 'utf8');

const helperMarker = 'function safeLocalLogoUrl(org) {';
if (!app.includes(helperMarker)) {
  const anchor = 'function organizationStates(org) {';
  if (!app.includes(anchor)) throw new Error('[club-logo-ui] organizationStates anchor missing');
  const helper = `function safeLocalLogoUrl(org) {
  if (org?.logoStatus !== 'present' || !org?.logo) return '';
  try {
    const url = new URL(org.logo, window.location.origin);
    if (url.origin !== window.location.origin) return '';
    if (!url.pathname.startsWith('/assets/images/clubs/')) return '';
    return \`${'${url.pathname}${url.search}'}\`;
  } catch {
    return '';
  }
}

function clubLogoMarkup(org) {
  const logoUrl = safeLocalLogoUrl(org);
  if (!logoUrl) return '';
  return \`<figure class="club-logo"><img src="${'${escaped(logoUrl)}'}" alt="${'${escaped(`Logo von ${org.name}`)}'}" loading="lazy" decoding="async"></figure>\`;
}

`;
  app = app.replace(anchor, `${helper}${anchor}`);
}

const cardOld = `  return \`
    <article class="club-card ${'${org.featured ? \'club-card-featured\' : \'\'}'}">
      <div class="club-card-topline"><span class="club-type">${'${escaped(labelForType(org.type))}'}</span>${'${badge}'}</div>
      <h3>${'${escaped(org.name)}'}</h3>
      <p class="club-location">${'${escaped(meta || \'Standort nicht hinterlegt\')}'}</p>
      ${'${distance}'}
      ${'${contactHint}'}
      <div class="club-card-actions">${'${actions}'}</div>
    </article>\`;
`;

const cardNew = `  const logo = clubLogoMarkup(org);
  return \`
    <article class="club-card ${'${org.featured ? \'club-card-featured\' : \'\'}'}">
      <div class="club-card-header${'${logo ? \'\' : \' club-card-header-no-logo\'}'}">
        ${'${logo}'}
        <div class="club-card-heading">
          <div class="club-card-topline"><span class="club-type">${'${escaped(labelForType(org.type))}'}</span>${'${badge}'}</div>
          <h3>${'${escaped(org.name)}'}</h3>
          <p class="club-location">${'${escaped(meta || \'Standort nicht hinterlegt\')}'}</p>
          ${'${distance}'}
        </div>
      </div>
      ${'${contactHint}'}
      <div class="club-card-actions">${'${actions}'}</div>
    </article>\`;
`;

if (!app.includes('class="club-card-header')) {
  if (!app.includes(cardOld)) throw new Error('[club-logo-ui] club card template anchor missing');
  app = app.replace(cardOld, cardNew);
}

const cssMarker = '/* Club logo cards — local V5-approved assets only */';
if (!styles.includes(cssMarker)) {
  styles += `

${cssMarker}
.club-card-header {
  display: grid;
  grid-template-columns: 78px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}
.club-card-header-no-logo { grid-template-columns: minmax(0, 1fr); }
.club-logo {
  width: 78px;
  height: 78px;
  margin: 0;
  padding: .45rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(11, 35, 54, .10);
  border-radius: 14px;
  background: #e8eef0;
  overflow: hidden;
}
.club-logo img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  object-position: center;
}
.club-card-heading { min-width: 0; }
.club-card-heading .club-card-topline { min-height: 1.2rem; }
.club-card-heading h3 { margin-top: .55rem; }

@media (max-width: 680px) {
  .club-card-header { grid-template-columns: 64px minmax(0, 1fr); gap: .8rem; }
  .club-card-header-no-logo { grid-template-columns: minmax(0, 1fr); }
  .club-logo { width: 64px; height: 64px; border-radius: 12px; padding: .35rem; }
}
`;
}

await writeFile(appPath, app);
await writeFile(stylesPath, styles);
console.log('[club-logo-ui] search card logo integration applied');
