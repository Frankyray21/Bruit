/**
 * Reconnaître le navigateur qui affiche le site — sans DOM, donc testable.
 *
 * Un lien ouvert depuis Messenger, Instagram, Teams ou l'app SMS s'affiche
 * dans un navigateur intégré (WebView) qui ne sait pas installer une app :
 * il faut le dire au travailleur, et lui donner le lien à ouvrir ailleurs.
 */

/** Adresse publique du site — celle du code QR et du bouton « Copier le lien ». */
export const URL_SITE = 'https://frankyray21.github.io/Bruit/';

const MOTIFS_INTEGRE = [
  /FBAN|FBAV|FB_IAB|FB4A/i, // Facebook, Messenger
  /Instagram/i,
  /Messenger/i,
  /Teams\//i, // Microsoft Teams mobile
  /MicroMessenger/i, // WeChat
  /\bLine\//i,
  /Snapchat/i,
  /TikTok|musical_ly|Bytedance/i,
  /; wv\)/, // WebView Android (Chrome)
  /\bwv\b.*Chrome/i,
];

export function estNavigateurIntegre(ua: string): boolean {
  if (MOTIFS_INTEGRE.some((m) => m.test(ua))) return true;
  // WebView iOS : un iPhone/iPad sans le mot « Safari » (les vrais navigateurs
  // iOS — Safari, Chrome « CriOS », Firefox « FxiOS » — le portent tous).
  const ios = /iPhone|iPad|iPod/.test(ua);
  if (ios && !/Safari\//.test(ua)) return true;
  return false;
}
