import { createMocks } from 'node-mocks-http';

import handleLink from '../pages/api/links';

describe('/api/links', () => {
  test('create new link', async () => {
    const url = new URL(process.env.FALLBACK_URL || '');
    url.pathname = Math.random().toString();

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        url: url.toString(),
      },
    });

    // @ts-expect-error request types
    await handleLink(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        slug: expect.stringMatching(/^([a-z]+)-([a-z]+)-([a-z]+)$/),
        link: expect.stringMatching(url.toString()),
      })
    );
  });

  test('non-conforming link fails', async () => {
    const url = 'https://some-bad-actor.io/clickbait-nonsense';

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        url,
      },
    });

    // @ts-expect-error request types
    await handleLink(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  test('create link rate-limit triggers', async () => {
    const url = new URL(process.env.FALLBACK_URL || '');
    url.pathname = Math.random().toString();

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        url,
      },
    });

    try {
      for (let i = 0; i < 5; i++) {
        // @ts-expect-error request types
        await handleLink(req, res);
      }
    } catch (e) {
      expect((e as Error).message).toBe('Rate limit exceeded');
    }

    expect(res._getStatusCode()).toBe(429);
  });
});
