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

type Data = {
  slug?: string;
  error?: string;
};

const cors = initMiddleware(
  Cors({
    origin: process.env.FALLBACK_URL
      ? new URL(process.env.FALLBACK_URL).origin
      : false,
    methods: ['GET', 'POST'],
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

export async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  await cors(req, res);
  await limiter(req, res);

  switch (req.method) {
    case 'GET':
      {
        try {
          const { index }: { index: number } = req.body;
          const slug = getSlugByIndex(get(index), slugs);
          res.status(200).json({ slug });
        } catch (e: unknown) {
          res.status(400).json({ error: 'Bad Request' });
        }
      }
      break;

    case 'POST':
      {
        const redis = new Redis(process.env.REDIS_URL);

        const index = await redis.incr('sequence');
        const slug = getSlugByIndex(get(index), slugs);

        redis.disconnect();
        res.status(200).json({ slug });
      }
      break;

    default:
      res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default withSentry(handler);
