import { Spread } from '@/components/book/Spread';
import { PageTitle } from '@/components/ui/Prose';

export default function Library() {
  return <Spread running="The Collection" folio={10}
    left={<PageTitle>The Collection</PageTitle>} right={<p>Coming in Task 9.</p>} />;
}
