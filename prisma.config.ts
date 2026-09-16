import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 drops the "prisma" block in package.json, so the seed command lives
// here now. The catch is that having this file at all stops the CLI loading
// .env for you, so that has to happen by hand. An explicit DATABASE_URL still
// wins, which is what `DATABASE_URL="..." npm run db:setup` relies on.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(path.join(process.cwd(), '.env'));
  } catch {
    // no .env here, so the variables are expected to come from the environment
  }
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
