import Link from 'next/link';
import { currentUser } from '@/lib/auth/guards';

/** Who is reading, and the way in. Server-rendered: it reads the session. */
export async function AccountLink() {
  const user = await currentUser();
  const firstName = user?.name?.split(/\s+/)[0];

  return user ? (
    <Link className="site__signin" href="/account">
      {firstName ?? 'My account'}
    </Link>
  ) : (
    <Link className="site__signin" href="/login">
      Sign in
    </Link>
  );
}
