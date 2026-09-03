import { SITE } from '@/config/brand';
import { LOGO_SEQUENCE } from '@/config/brand';
import type { CSSProperties } from 'react';

const CHANNELS = [
  ['Facebook', SITE.social.facebook],
  ['Instagram', SITE.social.instagram],
  ['X', SITE.social.twitter],
  ['LinkedIn', SITE.social.linkedin],
  ['YouTube', SITE.social.youtube],
] as const;

/** Agati's channels, each chip in one of the logo's colours. */
export function SocialLinks({ label = 'Follow Agati' }: { label?: string }) {
  return (
    <div className="social">
      <p className="social__label">{label}</p>
      <ul className="social__list">
        {CHANNELS.map(([name, href], i) => (
          <li key={name}>
            <a
              className="social__chip"
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              style={{ '--chip': LOGO_SEQUENCE[i % LOGO_SEQUENCE.length] } as CSSProperties}
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
