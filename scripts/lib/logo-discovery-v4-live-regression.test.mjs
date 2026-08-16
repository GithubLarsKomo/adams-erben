import assert from 'node:assert/strict';
import { classifyLogoCandidate } from './logo-discovery.mjs';

const alster = { name: 'Alster-Ruderverein Hanseat von 1925 e.V.', city: 'Hamburg' };
const alsterInfographic = {
  url: 'https://arv-hanseat.de/images/1479.jpg',
  kind: 'img',
  score: 45,
  label: 'Alster-Ruderverein Hanseat Deutschlands erster nachhaltiger und klimapositiver Ruderverein Konzept',
  directContext: 'Alster-Ruderverein Hanseat Deutschlands erster nachhaltiger und klimapositiver Ruderverein Konzept',
  context: 'Alster-Ruderverein Hanseat Deutschlands erster nachhaltiger und klimapositiver Ruderverein Konzept primary-content single content'
};
assert.notEqual(
  classifyLogoCandidate(alsterInfographic, alster, { text: 'Alster-Ruderverein Hanseat von 1925 e.V.' }).disposition,
  'accept',
  'article/infographic images mentioning the club must not auto-accept'
);

const cochem = { name: 'Cochemer Rudergesellschaft 1905 e.V.', city: 'Cochem' };
const cochemPortrait = {
  url: 'https://www.cochemer-rudergesellschaft.de/wp-content/uploads/2019/06/cropped-CRG-G113q-1.jpg',
  kind: 'img',
  score: 45,
  label: '',
  directContext: 'face no-margin-bottom lazy loaded jetpack-lazy-image',
  context: 'face no-margin-bottom lazy loaded jetpack-lazy-image card image-holder'
};
assert.notEqual(
  classifyLogoCandidate(cochemPortrait, cochem, { text: 'Cochemer Rudergesellschaft 1905 e.V.' }).disposition,
  'accept',
  'bare organization acronyms in photo filenames must not auto-accept'
);

console.log('logo-discovery v4 live false-positive regressions passed');
