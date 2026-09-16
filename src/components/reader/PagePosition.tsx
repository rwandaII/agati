'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { stageEl } from '@/components/book/screen';

/**
 * Where you are in the book.
 *
 * Nothing to press, since turning is done by tapping the page itself. Portalled
 * to the frame because the book clips whatever is rendered inside it, and the
 * frame is what comes round when the book is read rotated.
 */
export function PagePosition({ position }: { position: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !position) return null;

  return createPortal(<p className="pageturn__count">{position}</p>, stageEl());
}
