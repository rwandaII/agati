'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
    };
    if (mode === 'register') body.name = String(form.get('name') ?? '');

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Something went wrong. Please try again.');
        setBusy(false);
        return;
      }

      router.push(next || '/shelf');
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection.');
      setBusy(false);
    }
  }

  return (
    <form className="authform" onSubmit={onSubmit}>
      {mode === 'register' ? (
        <label className="filters__field">
          <span>Your name</span>
          <input name="name" type="text" required autoComplete="name" maxLength={80} />
        </label>
      ) : null}

      <label className="filters__field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>

      <label className="filters__field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={mode === 'register' ? 8 : 1}
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        />
      </label>

      {mode === 'register' ? (
        <p className="authform__hint">At least 8 characters.</p>
      ) : null}

      {error ? (
        <p className="authform__error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? 'One moment…' : mode === 'register' ? 'Create my account' : 'Sign in'}
      </button>
    </form>
  );
}
