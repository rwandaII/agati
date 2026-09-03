import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead } from '@/components/ui/Prose';
import { AuthForm } from '@/components/ui/AuthForm';

export const metadata: Metadata = { title: 'Sign in' };

type Search = { [k: string]: string | string[] | undefined };

export default async function Login({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const next = (Array.isArray(sp.next) ? sp.next[0] : sp.next) ?? '';

  return (
    <Spread
      running="Your Library Card"
      folio={16}
      left={
        <>
          <PageTitle kicker="Welcome back">Sign in</PageTitle>
          <Lead>
            Sign in to keep your place in every book you are reading, on any device you pick up.
          </Lead>
          <p>
            No account yet? <Link href="/register">Create one</Link> — it takes a moment and the
            free books stay free.
          </p>
        </>
      }
      right={
        <>
          <AuthForm mode="login" next={next} />
          <p className="authform__aside">
            Forgot your password? Write to{' '}
            <a href="mailto:info@agatilibrary.org">info@agatilibrary.org</a> and we will help.
          </p>
        </>
      }
    />
  );
}
