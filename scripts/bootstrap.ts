import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import Redis from 'ioredis';

import { seed, get } from '../lib/sequence';
import { generate } from '../lib/slug-set';

// Get root directory of executing script from ncc
const root = () => {
  const { typescriptLookupPath }: { typescriptLookupPath: string } = JSON.parse(
    process.env['__NCC_OPTS'] || '{}'
  );
  return dirname(typescriptLookupPath);
};

// Load env variables
dotenv.config({ path: join(root(), '..', '.env.local') });

// Entry point
(async () => {
  console.log('\n', chalk.green('=^..^=  BOOTSTRAP  =^..^='), '\n');

  //* Generate slug data
  const path = join(root(), '..', 'data', 'slugs.json');
  const slugs = generate();
  await writeFile(path, JSON.stringify(slugs), 'utf-8');
  console.log(chalk.yellow('Generated Slugs:'), path);

  //* Seed the sequence generator
  const base = seed(
    process.env.RANDOM_SEED
      ? parseInt(process.env.RANDOM_SEED)
      : Math.floor(Math.random() * Math.pow(2, 32))
  );
  console.log(chalk.yellow('Sequence Seed:'), chalk.cyan(base));

  //* Store the seeded index in redis
  const redis = new Redis(process.env.REDIS_URL);
  await redis.set('sequence', base);
  const rBase = await redis.get('sequence');
  console.log(
    chalk.yellow('Redis Sequence Key:'),
    chalk.magenta('"sequence"'),
    chalk.green('='),
    chalk.cyan(rBase)
  );

  //* Set the global generation key
  await redis.set('generation', slugs.generation);
  const rGen = await redis.get('generation');
  console.log(
    chalk.yellow('Redis Generation Key:'),
    chalk.magenta('"generation"'),
    chalk.green('='),
    chalk.cyan(rGen)
  );

  //* Set the generation counter
  const counter = `counter:gen-${slugs.generation}`;
  await redis.set(counter, 0);
  const rCounter = await redis.get('generation');
  console.log(
    chalk.yellow('Redis Generation Counter:'),
    chalk.magenta(`"${counter}"`),
    chalk.green('='),
    chalk.cyan(rCounter)
  );

  redis.disconnect();
})().catch((e: Error) => {
  console.log(e.name, e.message);
});
