import type { SeedBook } from '../src/content/types';

export type Wanted = Omit<SeedBook, 'pages' | 'author'> & { search: string; author?: string };

/**
 * The shelf Agati is building, roughly how a librarian would sort it.
 *
 * Titles resolve through Gutendex rather than hardcoded Gutenberg ids, and the
 * fetcher scores candidates on title overlap, so a search can't quietly seed
 * the wrong book.
 */
export const CATEGORIES = [
  'Fables',
  'Fairy Tales',
  'Adventure',
  'Animal Stories',
  "Children's Classics",
  'Fantasy',
  'Mystery',
  'Science Fiction',
  'Comics',
  'Agati Originals',
] as const;

const c = LOGO_HUES();
function LOGO_HUES() {
  return [
    '#00A7E1',
    '#FF8000',
    '#80C203',
    '#0071BA',
    '#FF5600',
    '#FF0012',
    '#FFBA00',
    '#0A8FC4',
    '#C24E03',
  ];
}

let n = 0;
const nextColour = () => c[n++ % c.length];

const book = (
  search: string,
  slug: string,
  title: string,
  category: string,
  summary: string,
  description: string,
  extra: Partial<Wanted> = {},
): Wanted => ({
  search,
  slug,
  title,
  category,
  summary,
  description,
  language: 'EN',
  accessType: 'FREE_FOREVER',
  priceRwf: 0,
  coverColor: nextColour(),
  ...extra,
});

export const WANTED: Wanted[] = [
  // Fables
  book('Aesop Fables Townsend', 'aesops-fables', 'Aesop’s Fables', 'Fables',
    'Short animal tales, each ending in a lesson worth carrying.',
    'The oldest collection of moral stories in the world, told a few lines at a time: the fox and the grapes, the tortoise and the hare, the lion and the mouse.',
    { featured: true }),

  book('Just So Stories Kipling', 'just-so-stories', 'Just So Stories', 'Fables',
    'How the elephant got its trunk, and other cheerful impossibilities.',
    'Origin stories invented for a child, told aloud and meant to be read the same way.'),

  book('Fables de La Fontaine', 'fables-de-la-fontaine', 'Fables de La Fontaine', 'Fables',
    'Les fables en vers, du corbeau et du renard à la cigale et la fourmi.',
    'Les fables les plus connues de la langue française, écrites pour être lues à voix haute.',
    { language: 'FR' }),

  // Fairy tales
  book('Grimms Fairy Tales', 'grimms-fairy-tales', 'Grimms’ Fairy Tales', 'Fairy Tales',
    'The tales the brothers Grimm collected from the people who told them.',
    'Two centuries of European storytelling, gathered from farmhouses and kitchens.'),

  book('Andersen Fairy Tales', 'andersens-fairy-tales', 'Andersen’s Fairy Tales', 'Fairy Tales',
    'The little mermaid, the ugly duckling, the emperor with no clothes.',
    'Hans Christian Andersen wrote sadness into children’s stories, and children have never minded.'),

  book('The Happy Prince and Other Tales', 'the-happy-prince', 'The Happy Prince', 'Fairy Tales',
    'A gilded statue and a swallow who stays too long into winter.',
    'Oscar Wilde’s fairy tales, which are kinder and sharper than they first appear.'),

  book('Vingt mille lieues sous les mers', 'vingt-mille-lieues',
    'Vingt mille lieues sous les mers', 'Science Fiction',
    'Le capitaine Nemo, le Nautilus, et beaucoup d’océan.',
    'Jules Verne construit un sous-marin des décennies avant tout le monde.',
    { language: 'FR' }),

  book('Le Tour du monde en quatre-vingts jours', 'le-tour-du-monde',
    'Le Tour du monde en quatre-vingts jours', 'Adventure',
    'Un pari, un domestique, et un horaire qui ne plie pas.',
    'Phileas Fogg fait le tour de la planète contre la montre.',
    { language: 'FR' }),

  // Adventure
  book('Treasure Island Stevenson', 'treasure-island', 'Treasure Island', 'Adventure',
    'A map, a one-legged cook, and a boy who should have stayed home.',
    'The book that invented almost everything we think we know about pirates.',
    { featured: true }),

  book('The Adventures of Tom Sawyer', 'tom-sawyer', 'The Adventures of Tom Sawyer', 'Adventure',
    'A fence that needed painting, and a boy who never picked up a brush.',
    'Mark Twain’s boyhood Mississippi: caves, treasure, funerals attended by the deceased.'),

  book('Robinson Crusoe Defoe', 'robinson-crusoe', 'Robinson Crusoe', 'Adventure',
    'Shipwrecked, alone, and obliged to invent everything again.',
    'Twenty-eight years on an island, and a footprint in the sand that changes it all.'),

  book('Gulliver Travels Swift', 'gullivers-travels', 'Gulliver’s Travels', 'Adventure',
    'Tied down by people six inches tall, and it gets stranger.',
    'Four voyages, each one a joke at the expense of somebody powerful.'),

  book('Around the World in Eighty Days', 'around-the-world-in-eighty-days',
    'Around the World in Eighty Days', 'Adventure',
    'A wager, a servant, and a timetable that will not bend.',
    'Jules Verne sends Phileas Fogg around the planet against the clock.'),

  // Animal stories
  book('The Jungle Book Kipling', 'the-jungle-book', 'The Jungle Book', 'Animal Stories',
    'Mowgli grows up among wolves and learns the law of the jungle.',
    'Stories of a boy raised by wolves, a mongoose who guards a household, and a white seal searching for a safe shore.',
    { featured: true }),

  book('The Wind in the Willows', 'wind-in-the-willows', 'The Wind in the Willows', 'Animal Stories',
    'Mole, Rat, Badger and the impossible Mr Toad, on the riverbank.',
    'A quiet classic about friendship, rivers, and knowing when to come home.'),

  book('Black Beauty Sewell', 'black-beauty', 'Black Beauty', 'Animal Stories',
    'A horse tells you what was done to him, plainly.',
    'Written to change how people treated horses, and it did.'),

  // Children's classics
  book('The Secret Garden Burnett', 'the-secret-garden', 'The Secret Garden', "Children's Classics",
    'A locked garden, a lonely child, and what grows when both are opened.',
    'Mary Lennox finds a walled garden nobody has entered for ten years.'),

  book('Anne of Green Gables', 'anne-of-green-gables', 'Anne of Green Gables', "Children's Classics",
    'An orphan arrives at the wrong farm and refuses to be sent back.',
    'Anne Shirley talks her way into a home, a school, and everyone’s affection.'),

  book('Heidi Spyri', 'heidi', 'Heidi', "Children's Classics",
    'A girl, a grandfather, and a mountain that will not let her go.',
    'Taken from the Alps to the city, Heidi simply refuses to thrive anywhere else.'),

  book('Little Women Alcott', 'little-women', 'Little Women', "Children's Classics",
    'Four sisters, one difficult winter, and a great deal of character.',
    'Meg, Jo, Beth and Amy March growing up while their father is away at the war.'),

  book('A Christmas Carol Dickens', 'a-christmas-carol', 'A Christmas Carol', "Children's Classics",
    'Three ghosts, one night, and a man with a great deal to answer for.',
    'Dickens on what a person owes the people around him, argued with spirits.'),

  // Fantasy
  book('Alice Adventures in Wonderland', 'alice-in-wonderland',
    'Alice’s Adventures in Wonderland', 'Fantasy',
    'A girl follows a hurrying rabbit and nothing behaves properly again.',
    'Still the strangest journey in children’s literature.'),

  book('The Wonderful Wizard of Oz', 'wizard-of-oz', 'The Wonderful Wizard of Oz', 'Fantasy',
    'A road of yellow brick, and four travellers who each want one thing.',
    'Dorothy walks to the Emerald City with a scarecrow, a tin man and a lion.'),

  book('Peter Pan Barrie', 'peter-pan', 'Peter Pan', 'Fantasy',
    'Second star to the right, and straight on till morning.',
    'The boy who would not grow up, and the girl who decided she would.'),

  book('Pinocchio Collodi', 'pinocchio', 'The Adventures of Pinocchio', 'Fantasy',
    'A puppet who lies, runs away, and is repeatedly sorry.',
    'Far stranger and harsher than the version most people remember.'),

  // Mystery
  book('The Adventures of Sherlock Holmes', 'sherlock-holmes', 'The Adventures of Sherlock Holmes',
    'Mystery',
    'Twelve cases, one impossible man, and Dr Watson taking notes.',
    'The stories that taught the world what a detective is supposed to sound like.',
    { featured: true }),

  // Sci-fi
  book('The Time Machine Wells', 'the-time-machine', 'The Time Machine', 'Science Fiction',
    'Forward eight hundred thousand years, to find out how it ends.',
    'H. G. Wells invents time travel and immediately uses it to worry about class.'),

  book('Twenty Thousand Leagues Under the Seas', 'twenty-thousand-leagues',
    'Twenty Thousand Leagues Under the Sea', 'Science Fiction',
    'Captain Nemo, the Nautilus, and a great deal of ocean.',
    'Jules Verne builds a submarine decades before anyone else managed one.'),

  book('The War of the Worlds Wells', 'war-of-the-worlds', 'The War of the Worlds',
    'Science Fiction',
    'Cylinders fall on England, and something climbs out.',
    'The first alien invasion, and still one of the frightening ones.'),
];
