/**
 * Agati's own photographs, downloaded from agatilibrary.org into public/agati.
 *
 * They fall into three groups, exactly as they do on their site: one colour
 * photograph of children reading, a set of black-and-white portraits of the
 * people who run Agati, and a wide black-and-white shot.
 *
 * The portraits are deliberately NOT matched to names. There is no way to tell
 * from a filename which co-founder each one shows, and putting the wrong name
 * to a real person's face is worse than leaving it blank. `FOUNDER_PHOTOS`
 * below is where Agati should make that assignment — one line each.
 */
export type Photo = { src: string; alt: string; portrait?: boolean };

/** Children reading. The one colour photograph, and the best thing they have. */
export const HERO: Photo = {
  src: '/agati/196173_3cd58cbc670f44c897aa621fe2c4cd1d.jpg',
  alt: 'Children reading together at an Agati library',
};

/** Wide colour photograph, reused where a scene rather than a face is wanted. */
export const WIDE: Photo = HERO;

/**
 * Each co-founder's own portrait.
 *
 * This pairing is not a guess at faces. It was read out of agatilibrary.org's
 * own page data, where every name sits beside exactly one image reference — and
 * it corroborates itself: the Creative Director is the one photographed in an
 * art studio.
 */
export const FOUNDER_PHOTOS: Record<string, string> = {
  'Patience Karekezi': '/agati/196173_eeafe87a827245e8892751cbb44a4f91.jpg',
  'Aime Mukiza': '/agati/196173_504601eef0594e50a0d331c0580f952d.jpg',
  'Sabine Isangwe': '/agati/196173_48d4c3e662724a50b940f56fa4858276.jpg',
  'Rigobert Uwiduhaye': '/agati/196173_78821b55c9fb40fb906b4180555c6791.jpg',
  'Prosper Munyabuhoro': '/agati/196173_24083decf1aa4f869a3bee620f601f7a.jpg',
  'Denyse Umuhuza': '/agati/196173_0099e8e9911b4a4b9e0814d2d2a5c914.jpg',
};

export const MARK_COLOUR = '/brand/agati-mark-colour.png';
export const MARK_GOLD = '/brand/agati-mark-gold.png';
