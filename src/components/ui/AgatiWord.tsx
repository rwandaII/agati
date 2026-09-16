import { LOGO_SEQUENCE } from '@/config/brand';

/** The word "Agati", lettered in the logo's own colours. */
export function AgatiWord({ text = 'Agati', className = '' }: { text?: string; className?: string }) {
  return (
    <span className={`agatiword ${className}`.trim()}>
      {[...text].map((ch, i) => (
        <span key={i} style={{ color: LOGO_SEQUENCE[i % LOGO_SEQUENCE.length] }}>
          {ch}
        </span>
      ))}
    </span>
  );
}
