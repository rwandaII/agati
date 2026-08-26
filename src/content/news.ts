export type SeedNews = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  publishedAt: string;
  featured?: boolean;
};

/**
 * What Agati has done. Drawn from the organisation's own account of its work:
 * the 2018 founding in Musanze, the growth to eight library spaces across five
 * districts, and the programmes that came out of the pandemic.
 */
export const NEWS: SeedNews[] = [
  {
    slug: 'eight-libraries-and-counting',
    title: 'Eight libraries, and counting',
    excerpt:
      'From one room in Musanze in 2018 to library spaces across five districts — and the harder question of what comes next.',
    category: 'Milestones',
    publishedAt: '2026-06-14',
    featured: true,
    body: `There are now eight Agati library spaces, in Musanze, Rubavu, Kicukiro, Nyamasheke and Karongi.

Counting them is the easy part. The number that matters is not how many rooms we have opened but how many are still open, still staffed, still stocked, and still trusted by the children who walk to them. A library that closes teaches a child something worse than never having had one at all.

Each new space has taught us that what worked in Musanze does not simply transplant. A room near a school fills at different hours than a room near a market. A district where most children read in Kinyarwanda needs a different shelf from one where French is common at home. We have learned to ask before we build, and to build smaller than we would like, so that we can keep it.

The eighth is not a finish line. It is the point at which we stopped describing ourselves as a library and started describing ourselves as a network — with everything that implies about logistics, about training, and about making sure the eighth space is as good as the first.`,
  },
  {
    slug: 'how-agati-began',
    title: 'How Agati began: six students and a folded pile of savings',
    excerpt:
      'In April 2018, six young people in Musanze emptied their savings onto a table, counted it, and asked a better question than "is it enough".',
    category: 'Milestones',
    publishedAt: '2026-05-02',
    body: `Agati was founded in April 2018 by six young people from Musanze who were, at the time, still students.

They had all grown up with the same gap. Children around them could read — schools had done that part — and then school ended in the afternoon and there was nothing to read. Literacy without books is a door opened onto an empty room.

None of them had money. They pooled personal savings, counted it, and bought what they could afford: fewer than two hundred second-hand books, in English, French and Kinyarwanda, most of them soft at the corners from other people's hands.

The six were Patience Karekezi, Aime Mukiza, Sabine Isangwe, Rigobert Uwiduhaye, Prosper Munyabuhoro and Denyse Umuhuza. They are still here, in the roles the organisation grew into needing: Director, Finance and Administration, Human Resources, Creative, Programmes, and Communications and Fundraising.

What changed over the following years was not the ambition but the discipline. The team that opened one room on enthusiasm became a team that thinks about sustainability, because enthusiasm opens a library and only planning keeps it open.`,
  },
  {
    slug: 'from-two-hundred-books-to-several-thousand',
    title: 'From under two hundred books to several thousand',
    excerpt:
      'The collection now runs to several thousand titles in three languages — and the shape of it matters as much as the size.',
    category: 'Milestones',
    publishedAt: '2026-04-11',
    body: `The first Agati shelf held fewer than two hundred books. The collection is now several thousand, in English, French and Kinyarwanda.

Growth of that kind is not simply accumulation. A collection has a shape, and the shape is where the work is. Too many donated books in one language and the children who read in another quietly stop coming. Too many titles pitched at one age and a whole cohort finds nothing to grow into.

Kinyarwanda titles remain the hardest to source and the most requested. A child reading in the language spoken at home reads faster, argues with the text more, and finishes more books. We buy Kinyarwanda where we can find it, and where we cannot, we increasingly commission it — which is part of why the Writers Residency exists.

Every book is catalogued. It is unglamorous work, and it is the difference between a library and a pile: if you do not know what you have, you cannot lend it, and you cannot see the gap you are about to buy into.`,
  },
  {
    slug: 'the-mobile-library-goes-further',
    title: 'The Mobile Library reaches where the buildings cannot',
    excerpt:
      'A crate of books, a bus, a motorcycle, and a very good tree. Supported by the Butterfield & Robinson Slow Fund.',
    category: 'Programs',
    publishedAt: '2026-03-08',
    featured: true,
    body: `The Agati Mobile Library exists because of a lesson the pandemic taught us bluntly: a library that is a building can be locked.

So we stopped waiting for children to reach us. Staff carry crates of books out along the ridge roads to communities with no library and no room that could become one. What they find instead is shade — under a tree, in a courtyard, beside a classroom — and shade is enough.

Sessions are not lessons. There is no test, no reading aloud in front of everyone, and no being told which book matches your level. The crate is opened and set on the ground, and children take whichever book they like, for whatever reason, and put it back and take another. For many of them it is the first time anybody has asked what they wanted to read.

Reading is only part of it. Staff run play and craft activities alongside, and caregivers stay as often as children do. The programme is funded through Butterfield & Robinson's Slow Fund Grant.

The constraint is simple and it is arithmetic: there are more children at every stop than there are books in the crate.`,
  },
  {
    slug: 'nge-nawe-dusome-radio',
    title: 'Nge Nawe Dusome: children reading on the radio',
    excerpt:
      'Born when every library door in the country shut at once — and kept because it turned out to do something the buildings never could.',
    category: 'Programs',
    publishedAt: '2026-02-19',
    body: `*Nge Nawe Dusome* — you and I, let us read — began during COVID-19, when the libraries closed and the children went home.

The format is simple. Children come on air and talk about the books they love. Then they read stories they have written themselves, which was not the original plan and has become the best part of the programme.

Radio does something no building can. It reaches a child with no library, no shelf, and no electricity in the room. It costs that child nothing and requires no journey. A story read aloud arrives whole.

It also changed who we thought the audience was. Caregivers listen. Older siblings listen. Teachers have told us they have heard their own pupils on air and understood something new about them.

The programme outlived the emergency that created it, which is usually the sign that a thing was worth doing on its own terms.`,
  },
  {
    slug: 'writers-residency',
    title: 'The Writers Residency: making the books we cannot buy',
    excerpt:
      'A sanctuary where new narratives are born and existing manuscripts are refined, run under Projet Appui Culture — Grands Lacs.',
    category: 'Programs',
    publishedAt: '2026-01-24',
    body: `Some of the books our shelves need do not exist yet. The Writers Residency is our answer to that.

Through a selective process, writers are invited into a residency — a space where new work is written and existing manuscripts are refined, away from the ordinary interruptions that keep a manuscript at eighty per cent for years.

The programme celebrates compelling voices with cash prizes and guidance towards publication. It operates under Projet Appui Culture — Grands Lacs (PAC-GL).

For a library, this is not a side project. The scarcity of Kinyarwanda titles for children is not a purchasing problem that money alone solves; past a certain point the books simply have not been written. A library that only buys is at the mercy of what publishers happen to produce. A library that also commissions can go looking for the book its shelf is missing.`,
  },
  {
    slug: 'book-cafes',
    title: 'Book Cafes: authors and readers around the same table',
    excerpt:
      'Sessions in libraries, book clubs, schools, universities and youth spaces, where the person who wrote the book is sitting across from you.',
    category: 'Programs',
    publishedAt: '2025-11-30',
    body: `A Book Cafe puts authors and readers around a shared table and lets the conversation go where it goes.

Sessions run in libraries, book clubs, schools, universities and youth spaces. The format is deliberately informal: this is discussion, not a lecture, and the readers are expected to have opinions.

Something specific happens when a young reader meets a writer in person. Books can seem to arrive from nowhere, finished, authored by people who are not quite real. Meeting one — who is tired, who has a day job, who will tell you which chapter nearly defeated them — converts writing from a natural phenomenon into a job that a person could decide to do.

Several of the young people who now attend our Young Writers Workshops came first to a Book Cafe. The programme runs with support from PAC-GL.`,
  },
  {
    slug: 'hospital-childrens-centers',
    title: 'Hospital libraries: for the children whose year is a ward',
    excerpt:
      'A safe, creative space to read, make things and play together — for children spending months in hospital.',
    category: 'Programs',
    publishedAt: '2025-10-15',
    body: `Some children spend a substantial part of a year in a hospital bed. Their treatment is handled. Almost nothing else is.

Our Hospital Children's Centers provide a physical space in which those children can read, do crafts, and play together. It is a small intervention with a disproportionate effect, because a hospital ward gives a child nothing to be curious about, and boredom in a child who is already frightened is its own kind of harm.

Children who cannot leave a bed are read to. Children who can, come to the space and stay for as long as they are able. Siblings and caregivers use it too — a family spending weeks in a hospital needs somewhere that is not the ward.

The programme is run in partnership with Project Life International and Ready for Reading.

Staff describe it, consistently, as the hardest of our programmes to work on and the one they would least like to stop.`,
  },
  {
    slug: 'summer-activities-2025',
    title: 'Summer at Agati: reading, play and going outside to look at things',
    excerpt:
      'Holiday programming built on the understanding that a long break with nothing in it undoes a year of school.',
    category: 'Programs',
    publishedAt: '2025-08-22',
    body: `School holidays are long, and for a child with no books at home a long holiday is where the previous year quietly drains away.

Our Summer Activities run through the break: reading sessions, play, nature discovery, and collaborative work in groups. The design principle is that this should not feel like extra school. Children who have just finished a year of instruction do not need more instruction; they need reasons to keep using what they learned.

So the reading is chosen, not assigned. The play is physical and loud. The nature sessions involve going outside and looking closely at something small for longer than feels reasonable, which is a skill that transfers directly to reading a difficult page.

Agati Play runs alongside — rope jumping, puzzles, crafts, singing and dancing, for children and the adults who brought them. Learning through play is not a softer version of learning. For younger children it is most of it.`,
  },
];
