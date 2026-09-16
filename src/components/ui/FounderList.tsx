import Image from 'next/image';
import { FOUNDER_PHOTOS } from '@/config/photos';

export type Founder = { name: string; role: string };

/**
 * The people who built Agati, at a size where you can actually see them.
 * Portraits are paired with names from agatilibrary.org's own page data, not
 * guessed from the faces.
 */
export function FounderList({ founders }: { founders: readonly Founder[] }) {
  return (
    <ul className="founders">
      {founders.map((f) => {
        const photo = FOUNDER_PHOTOS[f.name];
        return (
          <li key={f.name} className="founder">
            {photo ? (
              <Image
                className="founder__photo"
                src={photo}
                alt={f.name}
                width={420}
                height={560}
                quality={90}
                sizes="(max-width: 780px) 42vw, 220px"
              />
            ) : (
              <span className="founder__photo founder__photo--none" aria-hidden="true" />
            )}
            <span className="founder__name">{f.name}</span>
            <span className="founder__role">{f.role}</span>
          </li>
        );
      })}
    </ul>
  );
}
