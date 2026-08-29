import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead } from '@/components/ui/Prose';
import { AuthForm } from '@/components/ui/AuthForm';

export const metadata: Metadata = { title: 'Create an account' };

type Search = { [k: string]: string | string[] | undefined };

export default async function Register({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const next = (Array.isArray(sp.next) ? sp.next[0] : sp.next) ?? '';

  return (
    <Spread
      running="Your Library Card"
      folio={16}
      left={
        <>
          <PageTitle kicker="Join the library">Create an account</PageTitle>
          <Lead>
            An account remembers where you stopped reading, keeps the books you own, and starts the
            free week on any title that offers one.
          </Lead>
          <p>
            Already have one? <Link href="/login">Sign in instead</Link>.
          </p>
        </>
      }
      right={<AuthForm mode="register" next={next} />}
    />
  );
}
