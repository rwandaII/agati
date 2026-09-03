import Link from 'next/link';
import Image from 'next/image';
import { SITE } from '@/config/brand';
import { MARK_COLOUR } from '@/config/photos';
import { SocialLinks } from '@/components/ui/SocialLinks';

export function SiteFooter() {
  return (
    <footer className="site__footer">
      <div className="site__footerInner">
        <div className="site__footerCol">
          <Image src={MARK_COLOUR} alt="" aria-hidden="true" width={54} height={55} />
          <p className="site__footerMission">{SITE.mission}</p>
          <p className="site__footerMail">
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>

        <div className="site__footerCol">
          <h2 className="site__footerHead">The library</h2>
          <ul className="site__footerList">
            <li><Link href="/library">All books</Link></li>
            <li><Link href="/library?access=free">Free books</Link></li>
            <li><Link href="/subscribe">Read everything</Link></li>
            <li><Link href="/shelf">My shelf</Link></li>
            <li><Link href="/search">Search</Link></li>
          </ul>
        </div>

        <div className="site__footerCol">
          <h2 className="site__footerHead">Agati</h2>
          <ul className="site__footerList">
            <li><Link href="/about">About us</Link></li>
            <li><Link href="/programs">Programs</Link></li>
            <li><Link href="/news">What we have done</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li>
              <a href={SITE.donateUrl} target="_blank" rel="noreferrer noopener">Donate</a>
            </li>
          </ul>
        </div>

        <div className="site__footerCol">
          <SocialLinks />
        </div>
      </div>

      <p className="site__colophon">© {new Date().getFullYear()} Agati Library · {SITE.tagline}</p>
    </footer>
  );
}
