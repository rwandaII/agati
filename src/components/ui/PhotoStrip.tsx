import Image from 'next/image';
import type { Photo } from '@/config/photos';

/** A single photograph, laid into the page like a plate in a book. */
export function Plate({
  photo,
  caption,
  wide = false,
}: {
  photo: Photo;
  caption?: string;
  wide?: boolean;
}) {
  return (
    <figure className={`plate ${wide ? 'plate--wide' : ''} ${photo.portrait ? 'plate--portrait' : ''}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={wide ? 900 : 420}
        height={wide ? 600 : 560}
        className="plate__img"
        sizes={wide ? '(max-width: 780px) 92vw, 46vw' : '(max-width: 780px) 44vw, 18vw'}
      />
      {caption ? <figcaption className="plate__caption">{caption}</figcaption> : null}
    </figure>
  );
}

/** A row of portraits. Faces kept whole, never cropped at the neck. */
export function PortraitRow({ photos }: { photos: Photo[] }) {
  return (
    <div className="portraits">
      {photos.map((p) => (
        <Plate key={p.src} photo={p} />
      ))}
    </div>
  );
}
