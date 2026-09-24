/**
 * L'attestation en image — pour la garder sur son téléphone ou l'envoyer,
 * sans imprimante et sans réseau.
 *
 * Les fonctions de texte sont pures (testées) ; le dessin se fait dans un
 * canvas, avec les polices embarquées du site.
 */

export interface DonneesAttestation {
  readonly nom: string;
  /** Date ISO de la réussite. */
  readonly date: string;
  readonly bonnes: number;
  readonly total: number;
  readonly modulesSuivis: number;
  readonly modulesTotal: number;
}

export const TITRE_FORMATION = 'Protection auditive';
export const EMPLOYEUR = 'Machines Roger International';
export const MENTION_DECLARATIVE =
  'Attestation déclarative, générée sur l’appareil du travailleur. Ne constitue pas un registre de formation opposable.';

/** « Prénom Nom » → « prenom-nom » ; vide → « travailleur ». */
export function slug(texte: string): string {
  const s = texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'travailleur';
}

export function nomFichierAttestation(nom: string, dateIso: string): string {
  const jour = /^\d{4}-\d{2}-\d{2}/.test(dateIso) ? dateIso.slice(0, 10) : 'sans-date';
  return `attestation-${slug(nom)}-${jour}.png`;
}

export interface LignesAttestation {
  readonly kicker: string;
  readonly titre: string;
  readonly nom: string;
  readonly detail: string;
  readonly score: string;
  readonly mention: string;
}

export function lignesAttestation(
  d: DonneesAttestation,
  formaterDate: (iso: string) => string,
): LignesAttestation {
  return {
    kicker: 'Attestation de formation',
    titre: `${TITRE_FORMATION} — ${EMPLOYEUR}`,
    nom: d.nom.trim() || 'Travailleur',
    detail: `Formation complétée le ${formaterDate(d.date)}`,
    score: `Quiz : ${d.bonnes} / ${d.total} bonnes réponses · Modules suivis : ${d.modulesSuivis} / ${d.modulesTotal}`,
    mention: MENTION_DECLARATIVE,
  };
}

/** Réduit la taille de police jusqu'à ce que le texte tienne dans `largeur`. */
function ajuster(
  ctx: CanvasRenderingContext2D,
  texte: string,
  poids: number,
  taille: number,
  famille: string,
  largeur: number,
  min: number,
): void {
  ctx.font = `${poids} ${taille}px ${famille}`;
  while (ctx.measureText(texte).width > largeur && taille > min) {
    taille -= 2;
    ctx.font = `${poids} ${taille}px ${famille}`;
  }
}

/** Coupe un texte en lignes qui tiennent dans `largeur` px. */
function replier(ctx: CanvasRenderingContext2D, texte: string, largeur: number): string[] {
  const mots = texte.split(' ');
  const lignes: string[] = [];
  let courante = '';
  for (const mot of mots) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (ctx.measureText(essai).width > largeur && courante) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
  }
  if (courante) lignes.push(courante);
  return lignes;
}

/**
 * Dessine l'attestation (1200 × 800 px, fond blanc — lisible partout, y
 * compris imprimée depuis la galerie du téléphone).
 */
export async function dessinerAttestation(
  canvas: HTMLCanvasElement,
  d: DonneesAttestation,
  formaterDate: (iso: string) => string,
): Promise<void> {
  const L = 1200;
  const H = 800;
  canvas.width = L;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2D indisponible');

  const affiche = "'Barlow Condensed', 'Barlow', system-ui, sans-serif";
  const corps = "'Barlow', system-ui, sans-serif";
  const l = lignesAttestation(d, formaterDate);

  // Polices embarquées (@fontsource) : elles ne se chargent qu'à l'usage, et
  // fillText n'attend pas. On demande explicitement chaque style dessiné ;
  // un échec n'empêche pas l'export (repli système).
  if (typeof document !== 'undefined' && document.fonts?.load) {
    await Promise.allSettled([
      document.fonts.load(`700 26px ${affiche}`),
      document.fonts.load(`800 54px ${affiche}`),
      document.fonts.load(`500 34px ${corps}`),
      document.fonts.load(`400 30px ${corps}`),
    ]);
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, L, H);
  // Barre rouge de marque.
  ctx.fillStyle = '#d22325';
  ctx.fillRect(72, 72, 10, 120);

  ctx.fillStyle = '#6b7280';
  ctx.font = `700 26px ${affiche}`;
  ctx.fillText(l.kicker.toUpperCase(), 110, 108);

  ctx.fillStyle = '#0a0e17';
  ajuster(ctx, l.titre.toUpperCase(), 800, 54, affiche, L - 110 - 72, 30);
  ctx.fillText(l.titre.toUpperCase(), 110, 176);

  ajuster(ctx, l.nom, 800, 88, affiche, L - 144, 44);
  ctx.fillText(l.nom, 72, 340);

  ctx.fillStyle = '#1f2937';
  ctx.font = `500 34px ${corps}`;
  ctx.fillText(l.detail, 72, 410);
  ctx.font = `400 30px ${corps}`;
  ctx.fillText(l.score, 72, 462);

  // Filet et mention déclarative.
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 660);
  ctx.lineTo(L - 72, 660);
  ctx.stroke();
  ctx.fillStyle = '#6b7280';
  ctx.font = `400 22px ${corps}`;
  let y = 700;
  for (const ligne of replier(ctx, l.mention, L - 144)) {
    ctx.fillText(ligne, 72, y);
    y += 30;
  }
}

export type IssueExport = 'partage' | 'telechargement' | 'annule';

/**
 * Partage l'image (Messages, courriel…) si l'appareil le permet, sinon la
 * télécharge. « annule » quand la personne ferme la feuille de partage.
 */
export async function exporterAttestation(
  canvas: HTMLCanvasElement,
  nomFichier: string,
): Promise<IssueExport> {
  const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/png'));
  if (!blob) throw new Error("impossible de produire l'image");
  const fichier = new File([blob], nomFichier, { type: 'image/png' });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [fichier] })) {
    try {
      await nav.share({ files: [fichier], title: 'Attestation — Protection auditive' });
      return 'partage';
    } catch (e) {
      // Feuille fermée par la personne : c'est son choix, on n'insiste pas.
      if ((e as DOMException).name === 'AbortError') return 'annule';
      // Autre refus : on retombe sur le téléchargement.
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'telechargement';
}
