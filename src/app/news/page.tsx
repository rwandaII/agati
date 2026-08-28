import { Spread } from '@/components/book/Spread';
import { PageTitle } from '@/components/ui/Prose';

export default function News() {
  return <Spread running="What We Have Done" folio={8}
    left={<PageTitle>What We Have Done</PageTitle>} right={<p>Coming in Task 10.</p>} />;
}
