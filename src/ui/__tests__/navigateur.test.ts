import { describe, expect, it } from 'vitest';
import { estNavigateurIntegre } from '../navigateur.js';

const UA = {
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  safariIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1',
  firefoxAndroid:
    'Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0',
  bureau:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  messengerAndroid:
    'Mozilla/5.0 (Linux; Android 13; SM-G991B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36 [FBAN/Orca-Android;FBAV/466.0.0.36.109;]',
  facebookIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.34.109;FBBV/612345;FBDV/iPhone15,2]',
  instagramIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 334.0.0.28.94 (iPhone15,2; iOS 17_5; fr_CA)',
  teamsAndroid:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 TeamsMobile-Android/1416/1.0.0.2023173201',
  webviewAndroid:
    'Mozilla/5.0 (Linux; Android 12; SM-A525F Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36',
  smsIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
};

describe('estNavigateurIntegre', () => {
  it('reconnaît les vrais navigateurs', () => {
    for (const ua of [UA.chromeAndroid, UA.safariIos, UA.chromeIos, UA.firefoxAndroid, UA.bureau]) {
      expect(estNavigateurIntegre(ua), ua).toBe(false);
    }
  });

  it('reconnaît les navigateurs intégrés', () => {
    for (const ua of [
      UA.messengerAndroid,
      UA.facebookIos,
      UA.instagramIos,
      UA.teamsAndroid,
      UA.webviewAndroid,
      UA.smsIos,
    ]) {
      expect(estNavigateurIntegre(ua), ua).toBe(true);
    }
  });
});
