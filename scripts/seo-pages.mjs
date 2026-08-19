export const productionOrigin = 'https://adams-erben.de';
export const previewOrigin = 'https://preview.adams-erben.de';

export const retiredDetailPages = [
  { path: '/karl-adam/', file: 'karl-adam/index.html' },
  { path: '/adams-acht/', file: 'adams-acht/index.html' },
  { path: '/deutschlandachter-1960/', file: 'deutschlandachter-1960/index.html' },
  { path: '/ratzeburg/', file: 'ratzeburg/index.html' },
  { path: '/karl-adam-trainingsmethoden/', file: 'karl-adam-trainingsmethoden/index.html' },
  { path: '/rudern-verstehen/', file: 'rudern-verstehen/index.html' },
  { path: '/rudern-lernen/', file: 'rudern-lernen/index.html' },
  { path: '/ruderverein-finden/', file: 'ruderverein-finden/index.html' },
  { path: '/ueber-adams-erben/', file: 'ueber-adams-erben/index.html' }
];

export const pages = [
  {
    path: '/',
    file: 'index.html',
    shellVariant: 'landing',
    title: 'Adams Erben – Vom Kinosaal ins Boot',
    description: '„Adams Acht“ gesehen? Verstehe Rudern vom Grund her, entdecke Menschen und Geschichten des Sports und finde einen Ruderverein in deiner Nähe.',
    ogTitle: 'Adams Erben – Vom Kinosaal ins Boot',
    ogDescription: 'Der Film macht neugierig. Adams Erben erklärt Rudern, erzählt seine Geschichten und zeigt den Weg ins echte Ruderboot.',
    ogImage: '/assets/images/hero-skiff.webp',
    ogImageAlt: 'Ruderboot als Motiv von Adams Erben',
    index: true
  },
  {
    path: '/rudern/',
    file: 'rudern/index.html',
    shellVariant: 'rowing',
    title: 'Karl Adam, Ratzeburg und deutsche Rudergeschichte | Adams Erben',
    description: 'Historische und fachliche Vertiefung zu Karl Adam: Trainingssystem, Ratzeburg, Ost und West, Ruderakademie, Regatta und zeitgeschichtliche Einordnung.',
    ogTitle: 'Karl Adam und Ratzeburger Rudergeschichte | Adams Erben',
    ogDescription: 'Die historische und fachliche Vertiefung zu Karl Adam, Ratzeburg, Ost und West sowie der Entwicklung des Rudersports.',
    ogImage: '/assets/images/hero-skiff.webp',
    ogImageAlt: 'Ruderboot als Motiv von Adams Erben',
    index: true
  }
];
