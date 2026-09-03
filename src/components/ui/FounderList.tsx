import Image from 'next/image';
import { FOUNDER_PHOTOS } from '@/config/photos';

export type Founder = { name: string; role: string };

/** Each co-founder with their own photograph, the way Agati presents them. */
export function FounderList({ founders }: { founders: readonly Founder[] }) {
  return (
    <ul className="founders">
      {founders.map((f) => {
        const photo = FOUNDER_PHOTOS[f.name];
        return (
          <li key={f.name} className="founders__item">
            {photo ? (
              <Image
                className="founders__photo"
                src={photo}
                alt={f.name}
                width={240}
                height={320}
                quality={88}
                sizes="(max-width: 620px) 84px, 148px"
              />
            ) : (
              <span className="founders__photo founders__photo--none" aria-hidden="true" />
            )}
            <span className="founders__text">
              <span className="founders__name">{f.name}</span>
              <span className="founders__role">{f.role}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
