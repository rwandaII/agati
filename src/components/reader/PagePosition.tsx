'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { stageEl } from '@/components/book/screen';

/**
 * Where you are in the book.
 *
 * Turning a page is done by tapping the page itself, so there is nothing to
 * press here — just the count, kept off the paper and out of the way.
 * Portalled to the frame because the book clips whatever is rendered inside
 * it, and the frame is what comes round when the book is read turned.
 */
export function PagePosition({ position }: { position: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !position) return null;

  return createPortal(<p className="pageturn__count">{position}</p>, stageEl());
}
