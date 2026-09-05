import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('contrat de mise à jour sans interruption', () => {
  it('attend une action explicite au lieu de prendre le contrôle immédiatement', () => {
    const config = readFileSync('vite.config.ts', 'utf8');
    expect(config).toContain("registerType: 'prompt'");
    expect(config).toContain('skipWaiting: false');
    expect(readFileSync('src/main.tsx', 'utf8')).not.toMatch(/location\.reload|controllerchange/);
  });
  it('partage l’installation et utilise le stockage protégé', () => {
    const ui = readFileSync('src/ui/InstallerApp.tsx', 'utf8');
    expect(ui).toContain("useStockage('installer-masque', false)");
    expect(ui).not.toContain('localStorage.');
    expect(ui).toContain('export function BanniereMiseAJour');
    expect(ui).toContain('window.confirm');
    expect(ui).toContain('await updateServiceWorker(true)');
  });
});
