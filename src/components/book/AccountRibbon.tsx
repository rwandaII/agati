import Link from 'next/link';
import { currentUser } from '@/lib/auth/guards';

/** A small marker at the head of the book: who is reading, and a way in. */
export async function AccountRibbon() {
  const user = await currentUser();
  const firstName = user?.name?.split(/\s+/)[0];

  return (
    <div className="cardmark">
      <Link className="cardmark__link" href="/search" aria-label="Search the library">
        ⌕ Search
      </Link>
      {user ? (
        <Link className="cardmark__link" href="/account">
          {firstName ?? 'My account'}
        </Link>
      ) : (
        <Link className="cardmark__link" href="/login">
          Sign in
        </Link>
      )}
      <Link className="cardmark__link" href="/shelf">
        My shelf
      </Link>
    </div>
  );
}
