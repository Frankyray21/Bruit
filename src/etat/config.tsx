/**
 * Configuration partagée du calcul.
 *
 * Le facteur de dérating est exposé ici, et non codé en dur, parce que la
 * formation se contredit : 70 % à la diapo 13, 60 % dans l'exemple chiffré de
 * la diapo 14. L'arbitrage n'est pas cosmétique — il fait passer le mineur au
 * jackleg en double protection de 2 h 28 à 5 h 17.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { FACTEURS_DERATING_DEFAUT } from '../domain/protection.js';
import { useStockage } from './stockage.js';

interface Config {
  facteurBouchons: number;
  facteurCoquilles: number;
  setFacteurBouchons: (valeur: number) => void;
}

const ConfigContexte = createContext<Config | null>(null);

export function FournisseurConfig({ children }: { children: ReactNode }) {
  const [facteurBouchons, setFacteurBouchons] = useStockage(
    'facteur-bouchons',
    FACTEURS_DERATING_DEFAUT.bouchons,
  );

  return (
    <ConfigContexte.Provider
      value={{
        facteurBouchons,
        facteurCoquilles: FACTEURS_DERATING_DEFAUT.coquilles,
        setFacteurBouchons,
      }}
    >
      {children}
    </ConfigContexte.Provider>
  );
}

export function useConfig(): Config {
  const config = useContext(ConfigContexte);
  if (!config) throw new Error('useConfig hors du FournisseurConfig');
  return config;
}
