import type { Metadata } from 'next';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Rule } from '@/components/ui/Prose';
import { SITE } from '@/config/brand';
import { SocialLinks } from '@/components/ui/SocialLinks';

export const metadata: Metadata = {
  title: 'Get In Touch',
  description: `Contact Agati Library at ${SITE.email}, or support the eight library spaces across Rwanda.`,
};

const CHANNELS = [
  ['Facebook', SITE.social.facebook],
  ['X / Twitter', SITE.social.twitter],
  ['Instagram', SITE.social.instagram],
  ['LinkedIn', SITE.social.linkedin],
  ['YouTube', SITE.social.youtube],
] as const;

export default function Contact() {
  return (
    <Spread
      running="Get In Touch"
      folio={12}
      left={
        <>
          <PageTitle kicker="The last page">Get In Touch</PageTitle>
          <Lead>
            Whether you want to volunteer, donate books, write for us or bring a library to your
            community — write to us. Somebody reads every message.
          </Lead>

          <Heading>Email</Heading>
          <p>
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>

          <Heading>Where we are</Heading>
          <p>
            Eight library spaces across Musanze, Rubavu, Kicukiro, Nyamasheke and Karongi, plus the
            Mobile Library, which is wherever the road allows.
          </p>
        </>
      }
      right={
        <>
          <SocialLinks label="Follow the work" />

          <Rule />

          <Heading>Support a library</Heading>
          <p>
            Books, shelves, rent, and the fuel that carries a crate up a ridge road. Every
            contribution turns into something a child can hold.
          </p>
          <p className="cta">
            <a
              className="cta__button"
              href={SITE.donateUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Donate to Agati
            </a>
          </p>

          <p className="colophon">© {new Date().getFullYear()} Agati Library</p>
        </>
      }
    />
  );
}
