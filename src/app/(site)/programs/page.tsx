import type { Metadata } from 'next';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Scroller } from '@/components/ui/Prose';

export const metadata: Metadata = {
  title: 'Our Programs',
  description:
    'The Writers Residency, Book Cafes, the Agati Mobile Library, Hospital Children’s Centers, Agati Play, Nge Nawe Dusome radio, Young Writers Workshops, Read Aloud and Summer Activities.',
};

type Program = { name: string; body: string; partner?: string };

const LEFT: Program[] = [
  {
    name: 'Writers Residency',
    body: 'Through a selective process, writers are invited into a vibrant residency, a sanctuary where new narratives are born and existing manuscripts are refined. The programme celebrates compelling voices with cash prizes and guidance towards publication.',
    partner: 'PAC-GL',
  },
  {
    name: 'Book Cafes',
    body: 'Authors and readers entwined in thoughtful discourse, seated around a shared table. Sessions run in libraries, book clubs, schools, universities and youth spaces.',
    partner: 'PAC-GL',
  },
  {
    name: 'Agati Mobile Library',
    body: 'A travelling library reaching remote and underserved communities. Staff gather under trees, in community spaces and in classrooms to share reading and play with children and their caregivers.',
    partner: 'Butterfield & Robinson Slow Fund',
  },
  {
    name: 'Hospital Children’s Engagements',
    body: 'Hospital libraries give a safe, creative space to read, make things and play together, for children whose year is being spent in a ward.',
    partner: 'Project Life International · Ready for Reading',
  },
  {
    name: 'Agati Play',
    body: 'Physical, cognitive, emotional, creative and social learning through play: rope jumping, puzzles, crafts, singing and dancing, for children and caregivers together.',
  },
];

const RIGHT: Program[] = [
  {
    name: 'Nge Nawe Dusome',
    body: 'A radio programme where children share their favourite books on air and read their own original stories, amplifying young voices and building a community reading culture. Born during COVID-19 and kept ever since.',
  },
  {
    name: 'Young Writers Workshops',
    body: 'Children develop storytelling skills and learn the basic techniques to put their stories on paper in a compelling way, through creative writing instruction and character work.',
  },
  {
    name: 'Agati Read Aloud',
    body: 'Daily sessions of reading aloud, which builds foundational skills, introduces vocabulary and models fluent, expressive reading, including spelling bees built around book titles.',
    partner: 'PAC-GL',
  },
  {
    name: 'Summer Activities',
    body: 'Holiday programming of reading, play, nature discovery and collaborative learning, designed to help children relax while keeping the school year from draining away.',
  },
];

function ProgramList({ items }: { items: Program[] }) {
  return (
    <ul className="programs">
      {items.map((p) => (
        <li key={p.name} className="programs__item">
          <h3 className="programs__name">{p.name}</h3>
          <p className="programs__body">{p.body}</p>
          {p.partner ? <p className="programs__partner">with {p.partner}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export default function Programs() {
  return (
    <Spread
      running="Our Programs"
      folio={6}
      left={
        <Scroller>
          <PageTitle kicker="Nine ways in">Our Programs</PageTitle>
          <Lead>
            A library is a room, and a room can be locked. These are the ways Agati reaches children
            who cannot come to the room.
          </Lead>
          <ProgramList items={LEFT} />
        </Scroller>
      }
      right={
        <Scroller>
          <ProgramList items={RIGHT} />
        </Scroller>
      }
    />
  );
}
