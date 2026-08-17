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
    description: '„Adams Acht“ gesehen? Entdecke, wie Karl Adams Erbe heute weiterlebt, und finde einen Ruderverein in deiner Nähe, um Rudern selbst auszuprobieren.',
    ogTitle: 'Adams Erben – Vom Kinosaal ins Boot',
    ogDescription: 'Der Film macht neugierig. Adams Erben zeigt den Weg ins echte Ruderboot und zum Verein in deiner Nähe.',
    ogImage: '/assets/images/hero-skiff.webp',
    ogImageAlt: 'Ruderboot als Motiv von Adams Erben',
    index: true
  },
  {
    path: '/rudern/',
    file: 'rudern/index.html',
    shellVariant: 'rowing',
    title: 'Rudern verstehen – Karl Adams Erbe im Sport von heute | Adams Erben',
    description: 'Training, Technik, Ratzeburg, Deutschlandachter und Ruderkultur: die vertiefende Seite zu Karl Adams Erbe und zum Rudern von heute.',
    ogTitle: 'Rudern verstehen – Adams Erbe im Sport von heute',
    ogDescription: 'Die redaktionelle Vertiefung zu Karl Adam, Ratzeburg, Training, Technik und Ruderkultur.',
    ogImage: '/assets/images/hero-skiff.webp',
    ogImageAlt: 'Ruderboot als Motiv von Adams Erben',
    index: true
  }
];
