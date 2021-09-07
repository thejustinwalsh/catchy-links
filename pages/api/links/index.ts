import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import RateLimit from 'express-rate-limit';
import Redis from 'ioredis';
import { withSentry } from '@sentry/nextjs';

import { getSlugByIndex, Slugs } from 'lib/slug';
import { get } from 'lib/sequence';
import initMiddleware from 'lib/init-middleware';

import slugJSON from 'data/slugs.json';
const slugs = slugJSON as Slugs;

const cors = initMiddleware(
  Cors({
    origin: process.env.FALLBACK_URL
      ? new URL(process.env.FALLBACK_URL).origin
      : false,
    methods: ['POST'],
  })
);

const limiter = initMiddleware(
  // @ts-expect-error initMiddleware should be generic
  RateLimit({
    // @ts-expect-error initMiddleware should be generic
    keyGenerator: (req: NextApiRequest) => {
      return (
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress
      );
    },
    // @ts-expect-error initMiddleware should be generic
    handler: (
      req: NextApiRequest,
      res: NextApiResponse,
      next: (error?: any) => any
    ) => {
      res.status(429);
      next(new Error('Rate limit exceeded'));
    },
    windowMs: process.env.RATE_LIMIT_WINDOW
      ? parseInt(process.env.RATE_LIMIT_WINDOW)
      : 10 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX
      ? parseInt(process.env.RATE_LIMIT_MAX)
      : 100,
  })
);

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);
  await limiter(req, res);

  switch (req.method) {
    case 'POST':
      {
        const allowed = new URL(
          process.env.FALLBACK_URL ??
            req.headers.origin ??
            process.env.VERCEL_URL ??
            '' // throws type error
        );

        // Ensure link is within domain and not a protocol downgrade
        const { url } = req.body;
        const target = new URL(url);
        if (
          allowed &&
          (target.hostname !== allowed.hostname ||
            target.protocol !== allowed.protocol)
        ) {
          res.status(400).json({ error: 'Invalid URL' });
          return;
        }

        const redis = new Redis(process.env.REDIS_URL);

        // Increment sequence generator
        const index = await redis.incr('sequence');
        await redis.incr(`counter:gen-${slugs.generation}`);

        // Get Slug
        const slug = getSlugByIndex(get(index), slugs);

        // link key and hash values
        const key = `link:${slug}`;
        const hash = {
          link: target.toString(),
          hits: 0,
        };

        // Create if nonexistent (implicitly throwing away the slug as it appears to be a duplicate)
        const exists = await redis.exists(key);
        if (exists) {
          res.status(409).json({ error: 'Conflict' });
        } else {
          await redis.hset(key, hash);
          res.status(200).json({ slug, ...hash });
        }

        redis.disconnect();
      }
      break;

    default:
      res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default withSentry(handler);
