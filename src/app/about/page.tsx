import type { Metadata } from 'next';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Scroller } from '@/components/ui/Prose';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Agati was founded in April 2018 by six students in Musanze. It now runs eight library spaces across five districts of Rwanda.',
};

const FOUNDERS = [
  ['Patience Karekezi', 'Director'],
  ['Aime Mukiza', 'Finance Admin Director'],
  ['Sabine Isangwe', 'HR Director and Secretary'],
  ['Rigobert Uwiduhaye', 'Creative Director'],
  ['Prosper Munyabuhoro', 'Programme Director'],
  ['Denyse Umuhuza', 'Communications & Fundraising Director'],
] as const;

export default function About() {
  return (
    <Spread
      running="About Us"
      folio={4}
      left={
        <Scroller>
          <PageTitle kicker="Why, when, what">About Us</PageTitle>

          <Lead>
            We want to give Rwandan children access to books to widen their aspirations so they can
            break the cycle of poverty.
          </Lead>

          <Heading>Why</Heading>
          <p>
            Children learn to read at school, and then school ends in the afternoon and there is
            nothing to read. Literacy without books is a door opened onto an empty room. Agati is a
            learning sanctuary that extends beyond the formal classroom.
          </p>

          <Heading>When</Heading>
          <p>
            Six young people from Musanze — still students at the time — pooled their personal
            savings and opened the first Agati library in <strong>April 2018</strong> with fewer
            than 200 books.
          </p>

          <Heading>What</Heading>
          <p>
            There are now <strong>eight library spaces</strong>, in Musanze, Rubavu, Kicukiro,
            Nyamasheke and Karongi. The collection has grown from 200 books to several thousand, in
            English, French and Kinyarwanda.
          </p>

          <Heading>Our journey</Heading>
          <p>
            The team changed as the work did — from enthusiastic students to strategic thinkers
            focused on sustainability, because enthusiasm opens a library and only planning keeps it
            open. The pandemic pushed us out of our buildings and into the Mobile Library, the radio
            programme, the Young Writers Workshops and the Writers Residences.
          </p>
        </Scroller>
      }
      right={
        <Scroller>
          <Heading>Meet the co-founders</Heading>
          <ul className="founders">
            {FOUNDERS.map(([name, role]) => (
              <li key={name} className="founders__item">
                <span className="founders__name">{name}</span>
                <span className="founders__role">{role}</span>
              </li>
            ))}
          </ul>

          <Heading>Our partners</Heading>
          <p>
            Our programmes run with Projet Appui Culture — Grands Lacs (PAC-GL), Butterfield &amp;
            Robinson&rsquo;s Slow Fund, Project Life International and Ready for Reading.
          </p>

          <Heading>What we are for</Heading>
          <p>
            A book is not information. If it were only information you could read it once and be
            done. A book is a place, and you can go back to a place. Children who have one book know
            this. Children who have five hundred sometimes never find out.
          </p>
        </Scroller>
      }
    />
  );
}
