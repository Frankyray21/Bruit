/**
 * Coupe anatomique animée de l'oreille — SVG dessiné en code.
 *
 * Libre de droit par construction (aucun asset externe), légère, et
 * fonctionne hors-ligne comme le reste du site. Fidèle à l'anatomie de la
 * coupe frontale classique : pavillon (hélix, anthélix, conque, tragus,
 * lobule), conduit auditif dans l'os temporal, tympan, chaîne des osselets
 * (marteau, enclume, étrier) sur la fenêtre ovale, vestibule, trois canaux
 * semi-circulaires, cochlée en spirale, trompe d'Eustache, nerfs cochléaire
 * et vestibulaire. Ombrages et grain de l'os par dégradés et filtres SVG.
 *
 * Le son y fait son trajet : ondes dans l'air → tympan qui vibre → osselets
 * qui basculent → étrier qui pousse la fenêtre ovale → onde qui parcourt la
 * cochlée → signal qui file dans le nerf. Toutes les animations sont dans
 * styles.css sous `@media (prefers-reduced-motion: no-preference)`.
 */

import { Carte } from '../ui/composants.js';

const OS = 'M 296 62 C 380 36, 640 34, 724 92 C 766 122, 770 392, 730 434 C 650 476, 420 478, 302 446 C 286 400, 284 120, 296 62 Z';
/**
 * Spirale de la cochlée : 2,5 tours (l'humain en a 2,5 à 2,75), de la base
 * (tour le plus large, tourné vers l'oreille moyenne et les deux fenêtres) à
 * l'apex. Spirale d'Archimède échantillonnée : le rayon décroît linéairement.
 */
function spiraleCochlee(cx: number, cy: number, r0: number, r1: number, tours: number): string {
  const n = Math.round(tours * 48);
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const angle = Math.PI + t * tours * 2 * Math.PI; // départ à gauche, face à l'oreille moyenne
    const r = r0 + (r1 - r0) * t;
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')}`;
}
const COCHLEE = spiraleCochlee(570, 318, 52, 5, 2.5);

export function OreilleCoupe() {
  return (
    <Carte
      titre="Le trajet du son dans l'oreille"
      source="diapo 11"
      intro="Le son entre par le pavillon, fait vibrer le tympan, traverse les trois osselets, puis pousse la fenêtre ovale : l'onde parcourt la cochlée — c'est là que le bruit fait ses dégâts."
    >
      <svg
        className="oreille-svg"
        viewBox="0 0 800 500"
        role="img"
        aria-label="Coupe de l'oreille : le son entre par le pavillon et le conduit auditif, fait vibrer le tympan, traverse le marteau, l'enclume et l'étrier, puis la fenêtre ovale ; l'onde parcourt la cochlée en spirale, dont part le nerf auditif. Au-dessus de la cochlée, le vestibule et les trois canaux semi-circulaires ; en dessous, la trompe d'Eustache."
      >
        <defs>
          <radialGradient id="oc-fond" cx="55%" cy="45%" r="70%">
            <stop offset="0" stopColor="#141b2b" />
            <stop offset="1" stopColor="#090c14" />
          </radialGradient>
          <radialGradient id="oc-peau" cx="42%" cy="34%" r="80%">
            <stop offset="0" stopColor="#f6d2c2" />
            <stop offset="0.55" stopColor="#e3a893" />
            <stop offset="1" stopColor="#b4705f" />
          </radialGradient>
          <linearGradient id="oc-tissu" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d9a08e" />
            <stop offset="1" stopColor="#c58c7c" />
          </linearGradient>
          <linearGradient id="oc-os" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#efe5d3" />
            <stop offset="0.5" stopColor="#dccbae" />
            <stop offset="1" stopColor="#bfa684" />
          </linearGradient>
          <linearGradient id="oc-conduit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c98577" />
            <stop offset="0.3" stopColor="#8f5148" />
            <stop offset="0.7" stopColor="#5a2f2b" />
            <stop offset="1" stopColor="#3a1d1a" />
          </linearGradient>
          <linearGradient id="oc-cavite" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1a1c" />
            <stop offset="1" stopColor="#140c0d" />
          </linearGradient>
          <linearGradient id="oc-tympan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fbe9e4" stopOpacity="0.95" />
            <stop offset="1" stopColor="#d9b3ab" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="oc-osselet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbf6ec" />
            <stop offset="1" stopColor="#cdbc9f" />
          </linearGradient>
          <linearGradient id="oc-labyrinthe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4ecdd" />
            <stop offset="1" stopColor="#cbb797" />
          </linearGradient>
          <linearGradient id="oc-nerf" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f5c94f" />
            <stop offset="1" stopColor="#e0a52e" />
          </linearGradient>
          <filter id="oc-ombre" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.55" />
          </filter>
          <filter id="oc-ombre-douce" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
          </filter>
          <filter id="oc-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.30  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.55 0"
            />
          </filter>
          <filter id="oc-flou">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <filter id="oc-lueur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="oc-clip-os">
            <path d={OS} />
          </clipPath>
        </defs>

        <rect width="800" height="500" fill="url(#oc-fond)" />

        {/* Ondes sonores dans l'air */}
        <g fill="none" stroke="#4aa3ff" strokeLinecap="round">
          <path className="onde onde1" d="M 62 250 q -14 -32 0 -64" strokeWidth="3.5" />
          <path className="onde onde2" d="M 44 258 q -22 -40 0 -80" strokeWidth="3" />
          <path className="onde onde3" d="M 26 266 q -30 -48 0 -96" strokeWidth="2.5" />
        </g>

        {/* Tissus mous de la tête (peau, cartilage) autour du conduit */}
        <path
          d="M 238 92 C 262 84, 292 86, 302 96 C 296 210, 296 330, 304 444 C 290 454, 258 452, 238 444 C 226 330, 226 210, 238 92 Z"
          fill="url(#oc-tissu)"
        />
        <path d="M 246 100 C 244 210, 244 330, 250 440" fill="none" stroke="#f0c1b1" strokeWidth="6" opacity="0.5" />

        {/* Os temporal : masse osseuse, ombre portée, grain */}
        <g filter="url(#oc-ombre-douce)">
          <path d={OS} fill="url(#oc-os)" stroke="#a8916f" strokeWidth="2" />
        </g>
        <rect x="280" y="30" width="500" height="460" filter="url(#oc-grain)" clipPath="url(#oc-clip-os)" opacity="0.28" />
        {/* Cellules mastoïdiennes : alvéoles dans l'os, derrière l'oreille moyenne */}
        <g fill="#d3c1a1" stroke="#a8916f" strokeWidth="1" opacity="0.7">
          <ellipse cx="330" cy="120" rx="14" ry="10" />
          <ellipse cx="358" cy="104" rx="10" ry="8" />
          <ellipse cx="322" cy="150" rx="9" ry="7" />
          <ellipse cx="350" cy="140" rx="12" ry="9" />
          <ellipse cx="332" cy="380" rx="13" ry="9" />
          <ellipse cx="358" cy="400" rx="9" ry="7" />
          <ellipse cx="320" cy="412" rx="10" ry="8" />
        </g>

        {/* Creux de l'os qui loge l'oreille interne */}
        <ellipse cx="545" cy="272" rx="118" ry="104" fill="#7d6748" opacity="0.38" filter="url(#oc-flou)" />

        {/* Pavillon (oreille externe), en profil */}
        <g filter="url(#oc-ombre)">
          <path
            d="M 240 108 C 214 62, 148 66, 110 108 C 74 150, 68 234, 94 290 C 114 334, 160 360, 200 342 C 220 333, 230 318, 240 306 Z"
            fill="url(#oc-peau)"
            stroke="#b57466"
            strokeWidth="1.5"
          />
        </g>
        {/* Hélix : bourrelet du bord, lumière et ombre */}
        <path d="M 232 118 C 206 84, 152 88, 122 122 C 94 156, 90 226, 108 274" fill="none" stroke="#f6d5c6" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
        <path d="M 226 132 C 202 102, 160 106, 134 136 C 108 168, 106 226, 122 268" fill="none" stroke="#c98274" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
        {/* Anthélix */}
        <path d="M 212 154 C 176 170, 156 208, 158 254 C 159 278, 170 298, 186 312" fill="none" stroke="#d29282" strokeWidth="13" strokeLinecap="round" />
        <path d="M 212 154 C 178 172, 160 208, 162 250" fill="none" stroke="#f1c4b4" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
        {/* Fosse triangulaire et scapha */}
        <path d="M 196 128 C 180 130, 166 142, 160 160" fill="none" stroke="#c9857a" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        {/* Conque : la cuvette qui mène au conduit */}
        <path d="M 240 198 C 212 206, 198 236, 204 270 C 208 292, 224 304, 240 302 Z" fill="#b8706a" />
        <path d="M 240 206 C 220 214, 210 238, 214 266 C 217 282, 228 294, 240 294 Z" fill="#8f4f48" opacity="0.8" />
        {/* Tragus et antitragus */}
        <path d="M 240 222 C 226 228, 222 250, 234 264 L 240 264 Z" fill="#e0a494" stroke="#b57466" strokeWidth="1" />
        <path d="M 206 300 C 200 292, 208 282, 218 286 C 222 292, 216 302, 206 300 Z" fill="#d89b8b" />

        {/* Conduit auditif externe (cartilagineux puis osseux) */}
        <path
          d="M 236 224 C 292 214, 342 232, 398 220 L 402 272 C 342 262, 292 284, 236 276 Z"
          fill="url(#oc-conduit)"
        />
        <path d="M 236 224 C 292 214, 342 232, 398 220" fill="none" stroke="#e2a595" strokeWidth="3" opacity="0.9" />
        <path d="M 250 236 C 300 228, 340 242, 392 232" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.18" />
        <path d="M 236 276 C 292 284, 342 262, 402 272" fill="none" stroke="#5a2f2b" strokeWidth="3" />
        {/* Cérumen et poils près de l'entrée */}
        <path d="M 246 232 l 6 -8 M 258 230 l 5 -7 M 270 232 l 6 -8" stroke="#3b1f1c" strokeWidth="1.2" strokeLinecap="round" />

        {/* Oreille moyenne : cavité tympanique */}
        <path
          d="M 400 196 C 428 180, 460 186, 474 204 C 482 232, 482 266, 474 290 C 458 308, 428 312, 402 294 C 394 262, 394 228, 400 196 Z"
          fill="url(#oc-cavite)"
          stroke="#7a6247"
          strokeWidth="1.5"
        />
        {/* Trompe d'Eustache, vers le pharynx */}
        <path d="M 428 302 C 416 342, 396 384, 368 430" fill="none" stroke="#b58a80" strokeWidth="13" strokeLinecap="round" />
        <path d="M 428 302 C 416 342, 396 384, 368 430" fill="none" stroke="#5c3a36" strokeWidth="4" strokeLinecap="round" />

        {/* Tympan : membrane translucide, tendue, qui vibre */}
        <g className="oreille-tympan">
          <path
            d="M 394 212 C 412 234, 412 260, 396 282 C 404 260, 404 234, 394 212 Z"
            fill="url(#oc-tympan)"
            stroke="#fff2ee"
            strokeWidth="1.5"
          />
          <path d="M 397 220 C 406 236, 406 258, 398 274" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        </g>

        {/* Chaîne des osselets : marteau, enclume, étrier */}
        <g className="oreille-osselets" filter="url(#oc-ombre)">
          {/* Marteau : tête, col, manche fixé au tympan */}
          <path d="M 419 206 C 415 220, 409 236, 402 249" fill="none" stroke="url(#oc-osselet)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 419 206 C 415 220, 409 236, 402 249" fill="none" stroke="#a8977a" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <circle cx="420" cy="199" r="9.5" fill="url(#oc-osselet)" stroke="#a8977a" strokeWidth="1.2" />
          {/* Enclume : corps articulé avec la tête du marteau, branche longue */}
          <ellipse cx="435" cy="200" rx="10.5" ry="8.5" fill="url(#oc-osselet)" stroke="#a8977a" strokeWidth="1.2" />
          <path d="M 437 208 C 443 222, 447 234, 448 242" fill="none" stroke="url(#oc-osselet)" strokeWidth="5" strokeLinecap="round" />
          <path d="M 437 208 C 443 222, 447 234, 448 242" fill="none" stroke="#a8977a" strokeWidth="1" opacity="0.6" />
          <circle cx="449" cy="244" r="3.2" fill="#fbf6ec" stroke="#a8977a" strokeWidth="1" />
          {/* Étrier : deux branches et platine sur la fenêtre ovale */}
          <g className="oreille-etrier">
            <path d="M 452 244 C 458 235, 467 235, 470 240 M 452 244 C 458 253, 467 253, 470 248" fill="none" stroke="url(#oc-osselet)" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 452 244 C 458 235, 467 235, 470 240 M 452 244 C 458 253, 467 253, 470 248" fill="none" stroke="#a8977a" strokeWidth="0.8" opacity="0.7" />
            <rect x="469" y="233" width="4.5" height="22" rx="2" fill="#fbf6ec" stroke="#a8977a" strokeWidth="1" />
          </g>
        </g>

        {/* Nerfs vestibulaire et cochléaire, réunis en nerf auditif */}
        <g fill="none" strokeLinecap="round">
          <path d="M 522 256 C 600 270, 660 318, 704 336" stroke="#8a6a1a" strokeWidth="8" />
          <path d="M 522 256 C 600 270, 660 318, 704 336" stroke="url(#oc-nerf)" strokeWidth="5" />
          <path d="M 566 316 C 620 330, 680 332, 764 342" stroke="#8a6a1a" strokeWidth="11" />
          <path d="M 566 316 C 620 330, 680 332, 764 342" stroke="url(#oc-nerf)" strokeWidth="8" />
          <path d="M 566 312 C 620 326, 680 328, 764 338 M 566 320 C 620 334, 680 336, 764 346" stroke="#b8862a" strokeWidth="1" opacity="0.8" />
          <path className="oreille-nerf" d="M 566 316 C 620 330, 680 332, 764 342" stroke="#fff4c8" strokeWidth="2.5" />
        </g>

        {/* Oreille interne : labyrinthe osseux */}
        <g filter="url(#oc-ombre)">
          {/* Canaux semi-circulaires : tubes osseux (bord, tube, reflet) */}
          <g fill="none" strokeLinecap="round">
            <path d="M 498 218 A 44 44 0 1 1 542 238" stroke="#9f8c6c" strokeWidth="16" />
            <path d="M 498 218 A 44 44 0 1 1 542 238" stroke="url(#oc-labyrinthe)" strokeWidth="11" />
            <path d="M 498 218 A 44 44 0 1 1 542 238" stroke="#ffffff" strokeWidth="2.5" opacity="0.45" />
            <path d="M 516 240 A 40 40 0 1 1 570 246" stroke="#9f8c6c" strokeWidth="16" />
            <path d="M 516 240 A 40 40 0 1 1 570 246" stroke="url(#oc-labyrinthe)" strokeWidth="11" />
            <path d="M 516 240 A 40 40 0 1 1 570 246" stroke="#ffffff" strokeWidth="2.5" opacity="0.45" />
            <path d="M 514 246 A 30 20 -10 1 1 560 256" stroke="#9f8c6c" strokeWidth="14" />
            <path d="M 514 246 A 30 20 -10 1 1 560 256" stroke="url(#oc-labyrinthe)" strokeWidth="9" />
            <path d="M 514 246 A 30 20 -10 1 1 560 256" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
          </g>
          {/* Vestibule */}
          <ellipse cx="498" cy="246" rx="25" ry="29" fill="url(#oc-labyrinthe)" stroke="#9f8c6c" strokeWidth="2" />
          <ellipse cx="492" cy="236" rx="10" ry="12" fill="#ffffff" opacity="0.25" />
          {/* Fenêtre ovale (sous la platine de l'étrier) et fenêtre ronde */}
          <ellipse cx="474" cy="244" rx="3.5" ry="12" fill="#3b2a28" />
          <ellipse cx="514" cy="300" rx="4" ry="7" fill="#3b2a28" stroke="#9f8c6c" strokeWidth="1" />
          {/* Cochlée : coquille osseuse, canal, reflet nacré */}
          <path d={COCHLEE} fill="none" stroke="#7d6a4b" strokeWidth="22" strokeLinecap="round" />
          <path d={COCHLEE} fill="none" stroke="url(#oc-labyrinthe)" strokeWidth="17" strokeLinecap="round" />
          <path d={COCHLEE} fill="none" stroke="#cbb797" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
          <path d={COCHLEE} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        </g>
        {/* Onde qui parcourt la cochlée, de la base vers l'apex */}
        <path className="oreille-fluide" d={COCHLEE} fill="none" stroke="#5fe0ff" strokeWidth="5" strokeLinecap="round" filter="url(#oc-lueur)" />

        {/* Étiquettes et rappels */}
        <g className="oreille-etiq" fill="#dfe6f2" fontSize="14" fontWeight="600">
          <g stroke="#8fa0bf" strokeWidth="1.2" fill="none">
            <path d="M 150 336 L 132 362" />
            <path d="M 300 272 L 300 304" />
            <path d="M 398 284 L 398 316" />
            <path d="M 430 190 L 430 154" />
            <path d="M 548 166 L 576 128" />
            <path d="M 492 276 L 476 338" />
            <path d="M 566 372 L 566 408" />
            <path d="M 700 342 L 700 378" />
            <path d="M 372 428 L 350 454" />
            <path d="M 464 210 L 472 236" />
            <path d="M 464 292 L 508 300" />
          </g>
          <text x="118" y="380" textAnchor="middle">Pavillon</text>
          <text x="300" y="322" textAnchor="middle">Conduit auditif</text>
          <text x="398" y="334" textAnchor="middle">Tympan</text>
          <text x="430" y="132" textAnchor="middle">Osselets</text>
          <text x="430" y="148" textAnchor="middle" fontSize="11" fontWeight="500" fill="#b6c1d6">marteau · enclume · étrier</text>
          <text x="592" y="120" textAnchor="middle">Canaux semi-circulaires</text>
          <text x="470" y="356" textAnchor="middle">Vestibule</text>
          <text x="566" y="426" textAnchor="middle">Cochlée</text>
          <text x="700" y="396" textAnchor="middle">Nerf auditif</text>
          <text x="700" y="412" textAnchor="middle" fontSize="11" fontWeight="500" fill="#b6c1d6">vestibulocochléaire (VIII)</text>
          <text x="462" y="206" textAnchor="end" fontSize="11" fontWeight="500" fill="#b6c1d6">fenêtre ovale</text>
          <text x="462" y="290" textAnchor="end" fontSize="11" fontWeight="500" fill="#b6c1d6">fenêtre ronde</text>
          <text x="330" y="472" textAnchor="middle">Trompe d'Eustache</text>
          <text x="660" y="86" textAnchor="middle" fill="#8a7756" fontWeight="700" fontSize="13">OS TEMPORAL</text>
          <text x="40" y="150" fill="#79b9ff" fontSize="12" fontWeight="500">son</text>
        </g>
      </svg>

      <p className="carte__intro" style={{ marginBottom: 0, marginTop: 12 }}>
        À l'intérieur de la cochlée, des <strong>cellules ciliées</strong>{' '}
        transforment ces vibrations en signal nerveux. Le bruit intense les
        couche puis les détruit — et elles <strong>ne repoussent pas</strong>.
      </p>
    </Carte>
  );
}
