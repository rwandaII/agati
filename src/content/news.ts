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
 * What Agati has done, from the organisation's own account of its work: the
 * 2018 founding in Musanze, the growth to eight library spaces across five
 * districts, and the programmes that came out of the pandemic.
 */
export const NEWS: SeedNews[] = [
  {
    slug: 'eight-libraries-and-counting',
    title: 'Eight libraries, and counting',
    excerpt:
      'From one room in Musanze in 2018 to eight spaces across five districts, and the question of what comes next.',
    category: 'Milestones',
    publishedAt: '2026-06-14',
    featured: true,
    body: `There are now eight Agati library spaces: Musanze, Rubavu, Kicukiro, Nyamasheke and Karongi.

Counting them is the easy part. What we actually watch is how many are still open a year later, still staffed and still stocked. Opening a library isn't hard. Keeping one open is, and a library that closes is worse for a child than one that never opened.

What worked in Musanze didn't simply transplant. A room near a school fills up at different hours than a room near a market. In one district most of the children read in Kinyarwanda; in another there's more French spoken at home, so the shelf has to look different. We've learned to ask first, and to build smaller than we'd like so that we can keep it.

The eighth space isn't a finish line. It's roughly the point where we stopped calling ourselves a library and started calling ourselves a network, which so far mostly means more logistics and more staff training than any of us expected.`,
  },
  {
    slug: 'how-agati-began',
    title: 'How Agati began: six students and a folded pile of savings',
    excerpt:
      'In April 2018 six young people in Musanze emptied their savings onto a table and counted it.',
    category: 'Milestones',
    publishedAt: '2026-05-02',
    body: `Agati was founded in April 2018 by six young people from Musanze. All of them were students at the time.

They had all grown up with the same gap. The children around them could read, more or less, because school had done that part. Then school finished for the day and there was nothing at home to read.

Nobody had money. They pooled what they had saved, counted it, and bought what it covered: fewer than two hundred second-hand books in English, French and Kinyarwanda, most of them soft at the corners from whoever had owned them before.

The six were Patience Karekezi, Aime Mukiza, Sabine Isangwe, Rigobert Uwiduhaye, Prosper Munyabuhoro and Denyse Umuhuza. All six are still here, in the roles the organisation grew into needing: Director, Finance and Administration, Human Resources, Creative, Programmes, and Communications and Fundraising.

The ambition hasn't changed much since then. The planning has. You can open a library on enthusiasm, but you can't keep one open on it.`,
  },
  {
    slug: 'from-two-hundred-books-to-several-thousand',
    title: 'From under two hundred books to several thousand',
    excerpt:
      'Several thousand titles now, in three languages. The shape of the collection matters as much as the size.',
    category: 'Milestones',
    publishedAt: '2026-04-11',
    body: `The first Agati shelf held fewer than two hundred books. We're now at several thousand, in English, French and Kinyarwanda.

That isn't just accumulation. A collection has a shape, and the shape is where most of the work goes. If too many donated books arrive in one language, the children who read in another quietly stop turning up. If too many are pitched at one age, a whole group finds nothing to move on to.

Kinyarwanda titles are still the hardest to find and the most asked for. A child reading in the language spoken at home reads faster, argues with the text more, and finishes more books. We buy Kinyarwanda wherever we can find it. Where we can't, we increasingly commission it, which is part of why the Writers Residency exists.

Everything gets catalogued. It's dull work and nobody volunteers for it, but if you don't know what you have you can't lend it out, and you can't see the gap you're about to spend money on.`,
  },
  {
    slug: 'the-mobile-library-goes-further',
    title: 'The Mobile Library reaches where the buildings cannot',
    excerpt:
      'A crate of books, a bus, a motorcycle and a good tree. Funded by the Butterfield & Robinson Slow Fund.',
    category: 'Programs',
    publishedAt: '2026-03-08',
    featured: true,
    body: `The Mobile Library came out of something the pandemic made obvious: a library that is a building can be locked.

So we stopped waiting for children to come to us. Staff take crates of books out along the ridge roads, to places with no library and no room that could become one. What there usually is instead is shade, under a tree or in a courtyard or beside a classroom, and that turns out to be enough.

The sessions aren't lessons. No test, no reading aloud in front of everyone, nobody telling you which book matches your level. The crate goes on the ground and children take whichever book they want, for whatever reason, then put it back and take another. For a lot of them it's the first time anyone has asked what they'd like to read.

Reading is only half of it. Staff run play and craft activities alongside, and the caregivers often stay as long as the children do. The programme is funded through Butterfield & Robinson's Slow Fund Grant.

The constraint is simple arithmetic: there are always more children at a stop than there are books in the crate.`,
  },
  {
    slug: 'nge-nawe-dusome-radio',
    title: 'Nge Nawe Dusome: children reading on the radio',
    excerpt:
      'Started when every library door in the country shut at once, and kept because it does something the buildings cannot.',
    category: 'Programs',
    publishedAt: '2026-02-19',
    body: `*Nge Nawe Dusome* (you and I, let us read) started during COVID-19, when the libraries closed and the children went home.

The format is simple. Children come on air and talk about books they love, then read stories they've written themselves. The second part wasn't in the original plan. It's now the best thing about it.

Radio reaches a child who has no library, no shelf and no electricity in the room. It costs them nothing and they don't have to travel anywhere.

It also changed our idea of who was listening. Caregivers listen. Older brothers and sisters listen. Teachers have told us they've heard their own pupils on air and learned something about them they hadn't known.

The programme outlasted the emergency that produced it, which is usually a good sign.`,
  },
  {
    slug: 'writers-residency',
    title: 'The Writers Residency: making the books we cannot buy',
    excerpt:
      'A residency where new work gets written and half-finished manuscripts get finished. Run under Projet Appui Culture - Grands Lacs.',
    category: 'Programs',
    publishedAt: '2026-01-24',
    body: `Some of the books our shelves need haven't been written yet. The Writers Residency is our answer to that.

Writers are invited in through a selective process and given room to write new work or finish manuscripts they've been carrying around for years, away from the interruptions that keep a manuscript at eighty per cent indefinitely.

There are cash prizes and guidance towards publication. The programme runs under Projet Appui Culture - Grands Lacs (PAC-GL).

For a library this isn't a side project. The shortage of Kinyarwanda children's titles isn't only a purchasing problem. Past a certain point the books simply don't exist, and a library that only buys is stuck with whatever publishers happen to produce. Commissioning means we can go looking for the book the shelf is missing.`,
  },
  {
    slug: 'book-cafes',
    title: 'Book Cafes: authors and readers around the same table',
    excerpt:
      'Sessions in libraries, book clubs, schools, universities and youth spaces, with the author sitting across the table.',
    category: 'Programs',
    publishedAt: '2025-11-30',
    body: `A Book Cafe puts authors and readers around one table and lets the conversation go wherever it goes.

Sessions run in libraries, book clubs, schools, universities and youth spaces. It's deliberately informal. This is a discussion rather than a lecture, and the readers are expected to turn up with opinions.

Something specific happens when a young reader meets a writer face to face. Books can seem to arrive from nowhere, finished, written by people who aren't quite real. Then you meet one who is tired, who has a day job, who will tell you which chapter nearly beat them, and writing turns into a job somebody could decide to do.

Several of the young people now coming to our Young Writers Workshops came to a Book Cafe first. The programme runs with support from PAC-GL.`,
  },
  {
    slug: 'hospital-childrens-centers',
    title: 'Hospital libraries: for the children whose year is a ward',
    excerpt:
      'Somewhere to read, make things and play together, for children spending months in hospital.',
    category: 'Programs',
    publishedAt: '2025-10-15',
    body: `Some children spend a good part of a year in a hospital bed. The treatment is taken care of. Almost nothing else is.

The Hospital Children's Centers give those children somewhere to read, do crafts and play together. It's a small thing with an effect out of proportion to its size, because a ward gives a child nothing to be curious about, and boredom in a child who is already frightened does its own damage.

Children who can't leave the bed get read to. Children who can come to the space and stay as long as they're able. Siblings and caregivers use it too. A family spending weeks in a hospital needs somewhere to be that isn't the ward.

We run it in partnership with Project Life International and Ready for Reading.

Staff say it's the hardest of our programmes to work on and the last one they'd want to stop.`,
  },
  {
    slug: 'summer-activities-2025',
    title: 'Summer at Agati: reading, play and going outside to look at things',
    excerpt:
      'Holiday programming, because a long break with nothing in it undoes a lot of the school year.',
    category: 'Programs',
    publishedAt: '2025-08-22',
    body: `School holidays are long, and for a child with no books at home a long holiday is where a good part of the previous year quietly drains away.

Summer Activities run through the break: reading sessions, play, nature discovery, group work. The one rule is that it mustn't feel like extra school. Children who have just finished a year of instruction don't need more instruction. They need a reason to keep using what they picked up.

So the reading is chosen rather than assigned, the play is loud, and the nature sessions mostly consist of going outside and looking at something small for much longer than feels reasonable. That last one transfers to reading a difficult page better than you'd expect.

Agati Play runs alongside: rope jumping, puzzles, crafts, singing, dancing, for the children and for whoever brought them. Learning through play isn't a softer kind of learning. For the younger ones it's most of it.`,
  },
];
