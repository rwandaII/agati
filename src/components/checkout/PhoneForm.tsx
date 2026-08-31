'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { normalizeRwandaPhone } from '@/lib/payments/phone';
import { formatRwf } from '@/config/pricing';

type Props =
  | { kind: 'book'; slug: string; amountRwf: number; label: string }
  | { kind: 'subscription'; plan: 'MONTHLY' | 'YEARLY'; amountRwf: number; label: string };

export function PhoneForm(props: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parsed = normalizeRwandaPhone(phone);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!parsed) {
      setError('Enter a Rwandan mobile number, for example 0788 123 456.');
      return;
    }

    setBusy(true);

    const endpoint =
      props.kind === 'book' ? '/api/checkout/book' : '/api/checkout/subscription';
    const body =
      props.kind === 'book' ? { slug: props.slug, phone } : { plan: props.plan, phone };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) {
        setError(json.error ?? 'We could not start that payment.');
        setBusy(false);
        return;
      }

      // Some flows send the customer to the provider's own approval page.
      if (json.redirectUrl) {
        window.location.href = json.redirectUrl;
        return;
      }

      router.push(`/checkout/${json.reference}`);
    } catch {
      setError('We could not reach the server. Check your connection.');
      setBusy(false);
    }
  }

  return (
    <form className="phoneform" onSubmit={onSubmit}>
      <p className="phoneform__amount">
        {props.label}
        <strong>{formatRwf(props.amountRwf)}</strong>
      </p>

      <label className="filters__field">
        <span>Mobile money number</span>
        <input
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0788 123 456"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <p className="phoneform__network">
        {parsed ? (
          <>
            <span className="badge badge--free">{parsed.network}</span> +
            {parsed.countryCode} {parsed.number}
          </>
        ) : (
          <span className="phoneform__hint">MTN or Airtel, in Rwanda.</span>
        )}
      </p>

      {error ? (
        <p className="authform__error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn btn--primary" type="submit" disabled={busy || !parsed}>
        {busy ? 'Starting…' : `Pay ${formatRwf(props.amountRwf)}`}
      </button>

      <p className="phoneform__note">
        You will be asked to approve the payment on your phone. Nothing is charged until you do.
      </p>
    </form>
  );
}
