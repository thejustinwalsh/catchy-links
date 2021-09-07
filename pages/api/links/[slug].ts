import type { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import Redis from 'ioredis';
import { withSentry } from '@sentry/nextjs';

import initMiddleware from 'lib/init-middleware';

const cors = initMiddleware(
  Cors({
    origin: process.env.FALLBACK_URL
      ? new URL(process.env.FALLBACK_URL).origin
      : false,
    methods: ['GET'],
  })
);

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  const { slug } = req.query;

  switch (req.method) {
    case 'GET':
      {
        const redis = new Redis(process.env.REDIS_URL);

        const key = `link:${slug}`;
        const exists = await redis.exists(key);
        if (exists) {
          const link = await redis.hget(key, 'link');
          const hits = await redis.hincrby(key, 'hits', 1);
          res.status(200).json({ slug, link, hits });
        } else {
          res.status(404).json({ error: 'Not Found' });
        }

        redis.disconnect();
      }
      break;

    default:
      res.status(405).json({ error: 'Method Not Allowed' });
  }
}

export default withSentry(handler);
