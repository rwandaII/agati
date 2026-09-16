/**
 * Agati's brand colours, sampled from their logo.
 *
 * The mark is an open book whose pages branch like a tree, and every facet of
 * it is a different bright colour. These seven are the exact values taken from
 * the artwork on agatilibrary.org, nothing here is invented.
 */
export const LOGO_COLOURS = {
  cyan: '#00A7E1',
  orange: '#FF8000',
  green: '#80C203',
  blue: '#0071BA',
  flame: '#FF5600',
  red: '#FF0012',
  gold: '#FFBA00',
} as const;

/** The order the letters of AGATI are coloured in, and the section tabs too. */
export const LOGO_SEQUENCE = [
  LOGO_COLOURS.gold,
  LOGO_COLOURS.cyan,
  LOGO_COLOURS.green,
  LOGO_COLOURS.orange,
  LOGO_COLOURS.blue,
  LOGO_COLOURS.red,
  LOGO_COLOURS.flame,
] as const;

export const BRAND = {
  colors: {
    ...LOGO_COLOURS,
    ink: '#22303A',
    inkSoft: '#5C6B75',
    paper: '#F8F3E6',
    paperEdge: '#E7DEC8',
    desk: '#0E2A3A',
    deskDeep: '#081C28',
  },
  fonts: {
    display: "'Montserrat', system-ui, sans-serif",
    body: "'Lora', Georgia, serif",
  },
} as const;

export const SITE = {
  name: 'Agati Library',
  tagline: 'community solution',
  mission:
    'By providing Rwandan children and youth access to books, we aim to broaden ' +
    'their aspirations and empower them to break the cycle of poverty.',
  email: 'info@agatilibrary.org',
  donateUrl: 'https://give-usa.keela.co/agati-donate-page2',
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100075736004282',
    twitter: 'https://twitter.com/AgatiRwanda',
    instagram: 'https://www.instagram.com/agati_library',
    linkedin: 'https://www.linkedin.com/company/agati-library/',
    youtube: 'https://www.youtube.com/channel/UC3ydQCJ0PhvOYv4xzL4SJQw',
  },
} as const;
