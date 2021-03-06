import type { NextApiRequest, NextApiResponse } from 'next';

export default function initMiddleware(
  middleware: (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (err?: any) => any
  ) => void
) {
  return (req: NextApiRequest, res: NextApiResponse) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result?: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}
