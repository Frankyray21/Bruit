import { describe, expect, it } from 'vitest';
import { lignesAttestation, nomFichierAttestation, slug } from '../attestation.js';

describe('nom de fichier', () => {
  it('retire accents et espaces, garde la date du jour de réussite', () => {
    expect(nomFichierAttestation('Émile Côté-Tremblay', '2026-09-24T18:12:00.000Z')).toBe(
      'attestation-emile-cote-tremblay-2026-09-24.png',
    );
  });
  it('a un repli quand le nom est vide ou la date invalide', () => {
    expect(nomFichierAttestation('   ', 'n importe quoi')).toBe(
      'attestation-travailleur-sans-date.png',
    );
  });
  it('slug', () => {
    expect(slug("Jean-François O'Neil")).toBe('jean-francois-o-neil');
  });
});

describe('lignes de l attestation', () => {
  it('reprend le nom, la date en clair, le score et les modules', () => {
    const l = lignesAttestation(
      { nom: ' Marie Roy ', date: '2026-09-24', bonnes: 12, total: 14, modulesSuivis: 6, modulesTotal: 6 },
      () => '24 septembre 2026',
    );
    expect(l.nom).toBe('Marie Roy');
    expect(l.detail).toBe('Formation complétée le 24 septembre 2026');
    expect(l.score).toBe('Quiz : 12 / 14 bonnes réponses · Modules suivis : 6 / 6');
    expect(l.titre).toContain('Machines Roger');
    expect(l.mention).toMatch(/déclarative/);
  });
});
