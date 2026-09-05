import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readdirSync } from 'node:fs';
import { MediaADemande } from '../../anim3d/MediaADemande.js';
import { HeroOreille } from '../../anim3d/HeroOreille.js';
import { AnimationSon } from '../../anim3d/AnimationSon.js';
import { SKETCHFAB_SRC } from '../../anim3d/sketchfab.js';

describe('Médias à la demande', () => {
  it('n’instancie pas la scène avant une action', () => {
    const markup = renderToStaticMarkup(<MediaADemande titre="Cochlée"><canvas data-testid="scene" /></MediaADemande>);
    expect(markup).toContain('Ouvrir la vue 3D');
    expect(markup).not.toContain('<canvas');
  });
  it('n’intègre aucun lecteur externe au premier rendu', () => {
    const markup = renderToStaticMarkup(<HeroOreille />);
    expect(markup).toContain('Charger le modèle Sketchfab');
    expect(markup).not.toContain('<iframe');
    expect(new URL(SKETCHFAB_SRC).searchParams.get('autostart')).toBe('0');
    expect(new URL(SKETCHFAB_SRC).searchParams.get('autospin')).toBe('0');
  });
  it('inventorie les fichiers réellement livrés', () => {
    expect([...__MODELES_LOCAUX__].sort()).toEqual(readdirSync('public/models').filter(n => n.endsWith('.glb')).sort());
    expect([...__VIDEOS_LOCALES__].sort()).toEqual(readdirSync('public/videos').filter(n => n.endsWith('.mp4')).sort());
  });
  const props = { titre: 'Animation', source: 'NIH', intro: 'Ressource', lien: 'https://example.org/video', lienNom: 'la source', note: 'crédit' };
  it('ne crée pas de lecteur pour un fichier absent', () => {
    const markup = renderToStaticMarkup(<AnimationSon {...props} fichier="absent.mp4" />);
    expect(markup).not.toContain('<video');
    expect(markup).toContain('Voir l&#x27;animation');
  });
  it('laisse la lecture de la vidéo locale à l’utilisateur', () => {
    const markup = renderToStaticMarkup(<AnimationSon {...props} fichier="videoplayback.mp4" />);
    expect(markup).toContain('<video');
    expect(markup).toContain('muted');
    expect(markup).not.toContain('autoPlay');
    expect(markup).not.toContain('autoplay');
    expect(markup).toContain('preload="metadata"');
  });
});
