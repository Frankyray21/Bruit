import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CourbeNiveau, niveauDepuisPointeur, niveauDepuisTouche } from '../Graphe.js';
import { Champ, Curseur, Selecteur, Resultat, Verdict } from '../composants.js';

describe('Repère tactile du graphique', () => {
  it.each([0.65, 1, 1.5, 2.8])('conserve 85 dBA au même point après un redimensionnement ×%s', (zoom) => {
    // L'axe 80–116 est dessiné entre x=44 et x=346 dans le viewBox.
    const x85 = 44 + ((85 - 80) / 36) * 302;
    const matrice = { a: zoom, b: 0, c: 0, d: zoom, e: 27, f: 140 };
    expect(niveauDepuisPointeur(27 + x85 * zoom, 140 + 50 * zoom, matrice, 80, 116)).toBe(85);
  });

  it('le début du tracé signifie 85, pas une fraction de la largeur du cadre', () => {
    const matrice = { a: 2, b: 0, c: 0, d: 2, e: 13, f: 70 };
    expect(niveauDepuisPointeur(13 + 44 * 2, 90, matrice, 85, 115)).toBe(85);
    expect(niveauDepuisPointeur(13 + 346 * 2, 90, matrice, 85, 115)).toBe(115);
  });

  it('borne les glissements dans les marges aux deux extrêmes', () => {
    const matrice = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    expect(niveauDepuisPointeur(-100, 80, matrice, 85, 115)).toBe(85);
    expect(niveauDepuisPointeur(600, 80, matrice, 85, 115)).toBe(115);
  });

  it('respecte également une transformation inclinée', () => {
    const matrice = { a: 1.6, b: 0.2, c: 0.3, d: 1.8, e: 40, f: 90 };
    const x = 44 + ((94 - 85) / 30) * 302;
    const y = 70;
    expect(niveauDepuisPointeur(matrice.a * x + matrice.c * y + matrice.e,
      matrice.b * x + matrice.d * y + matrice.f, matrice, 85, 115)).toBe(94);
  });

  it('ignore un repère non dessinable', () => {
    expect(niveauDepuisPointeur(100, 20, { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 }, 85, 115)).toBeNull();
  });
});

describe('Réglage clavier du graphique', () => {
  it('utilise des pas de 0,1 dBA sans dérive décimale', () => {
    expect(niveauDepuisTouche('ArrowRight', 85, 80, 116)).toBe(85.1);
    expect(niveauDepuisTouche('ArrowDown', 85.1, 80, 116)).toBe(85);
    expect(niveauDepuisTouche('PageUp', 85, 80, 116)).toBe(86);
  });
  it('atteint les bornes et y reste', () => {
    expect(niveauDepuisTouche('Home', 95, 85, 115)).toBe(85);
    expect(niveauDepuisTouche('End', 95, 85, 115)).toBe(115);
    expect(niveauDepuisTouche('ArrowLeft', 85, 85, 115)).toBe(85);
    expect(niveauDepuisTouche('PageUp', 115, 85, 115)).toBe(115);
  });
  it('ne détourne pas les autres touches, dont Tab', () => {
    expect(niveauDepuisTouche('Tab', 85, 85, 115)).toBeNull();
    expect(niveauDepuisTouche('Escape', 85, 85, 115)).toBeNull();
  });
});

const options = [{ id: 'bouchons', nom: 'Bouchons' }];
const neRienFaire = () => {};
const curseur = <Curseur min={0} max={240} pas={1} valeur={20} onChange={neRienFaire} affichage="20 min" legende="temps sans protection" />;
const selecteur = <Selecteur options={options} valeur="bouchons" onChange={neRienFaire} />;
const attribut = (html: string, nom: string) => html.match(new RegExp(`${nom}="([^"]*)"`))?.[1];

describe('Étiquettes et retours accessibles', () => {
  it('nomme séparément un sélecteur et un curseur dans le même champ', () => {
    const html = renderToStaticMarkup(<Champ etiquette="Protection A">{selecteur}{curseur}</Champ>);
    const labelId = html.match(/class="champ__etiquette" id="([^"]+)"/)![1];
    const select = html.match(/<select[^>]*>/)![0];
    const input = html.match(/<input[^>]*>/)![0];
    expect(attribut(select, 'aria-labelledby')).toBe(labelId);
    const labelsCurseur = attribut(input, 'aria-labelledby')!.split(' ');
    expect(labelsCurseur[0]).toBe(labelId);
    expect(labelsCurseur).toHaveLength(2);
    expect(html).toContain(`id="${labelsCurseur[1]}">temps sans protection`);
    expect(attribut(input, 'aria-valuetext')).toBe('20 min');
  });

  it('ne partage pas les identifiants de deux champs', () => {
    const html = renderToStaticMarkup(<><Champ etiquette="Protection A">{selecteur}</Champ><Champ etiquette="Protection B">{selecteur}</Champ></>);
    const noms = [...html.matchAll(/<select[^>]*aria-labelledby="([^"]+)"/g)].map(m => m[1]);
    expect(noms).toHaveLength(2);
    expect(new Set(noms).size).toBe(2);
  });

  it('accepte une étiquette spécifique qui prime sur celle du groupe', () => {
    const html = renderToStaticMarkup(<Champ etiquette="Protection A"><Curseur min={0} max={240} pas={1} valeur={20} onChange={neRienFaire} affichage="20 min" etiquette="Durée de retrait" /></Champ>);
    const input = html.match(/<input[^>]*>/)![0];
    expect(attribut(input, 'aria-label')).toBe('Durée de retrait');
    expect(attribut(input, 'aria-labelledby')).toBeUndefined();
  });

  it('expose les bornes, les unités et le résultat de la courbe interactive', () => {
    const html = renderToStaticMarkup(<CourbeNiveau min={85} max={115} valeur={85} f={v => v} reperesX={[]} graduationsY={[{valeur:0,label:'0'},{valeur:120,label:'120'}]} etiquetteValeur="8 h" ton="vert" aria="Durée selon le bruit" onChange={neRienFaire} />);
    const svg = html.match(/<svg[^>]*>/)![0];
    expect(attribut(svg, 'role')).toBe('slider');
    expect(attribut(svg, 'tabindex')).toBe('0');
    expect(attribut(svg, 'aria-label')).toBe('Durée selon le bruit');
    expect(attribut(svg, 'aria-valuemin')).toBe('85');
    expect(attribut(svg, 'aria-valuemax')).toBe('115');
    expect(attribut(svg, 'aria-valuenow')).toBe('85');
    expect(attribut(svg, 'aria-valuetext')).toBe('85 dBA — 8 h');
  });

  it('garde une courbe informative sans contrôle clavier fictif', () => {
    const html = renderToStaticMarkup(<CourbeNiveau min={85} max={115} valeur={85} f={v => v} reperesX={[]} graduationsY={[{valeur:0,label:'0'},{valeur:120,label:'120'}]} etiquetteValeur="8 h" ton="vert" aria="Durée selon le bruit" />);
    expect(attribut(html, 'role')).toBe('img');
    expect(attribut(html, 'tabindex')).toBeUndefined();
    expect(attribut(html, 'aria-valuenow')).toBeUndefined();
  });

  it('annonce le verdict poliment, sans multiplier les régions live pour chaque valeur', () => {
    const html = renderToStaticMarkup(<><Resultat etiquette="Dose" valeur="50 %" /><Verdict niveau="jaune" message="Attention, dose élevée" /></>);
    expect(html.match(/role="status"/g)).toHaveLength(1);
    expect(attribut(html, 'aria-live')).toBe('polite');
    expect(attribut(html, 'aria-atomic')).toBe('true');
  });
});
