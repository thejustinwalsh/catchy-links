import { createMocks } from 'node-mocks-http';

import { getIndexBySlug, getSlugByIndex, Slugs } from '../lib/slug';
import handleSlug from '../pages/api/slug';

import slugJSON from '../data/slugs.json';
const slugs = slugJSON as Slugs;

describe('/lib/slug', () => {
  test('consistent index for slug', async () => {
    const pIndex = getIndexBySlug(
      `${slugs.values.predicates[1]}-${slugs.values.objects[0]}-${slugs.values.modifiers[0]}`,
      slugs
    );
    const oIndex = getIndexBySlug(
      `${slugs.values.predicates[0]}-${slugs.values.objects[1]}-${slugs.values.modifiers[0]}`,
      slugs
    );
    const mIndex = getIndexBySlug(
      `${slugs.values.predicates[0]}-${slugs.values.objects[0]}-${slugs.values.modifiers[1]}`,
      slugs
    );

    expect(pIndex).toEqual(
      slugs.values.objects.length * slugs.values.modifiers.length
    );
    expect(oIndex).toEqual(1);
    expect(mIndex).toEqual(slugs.values.modifiers.length);
  });

  test('consistent slug for index', async () => {
    const slug = getSlugByIndex(slugs.values.modifiers.length, slugs);
    expect(slug).toEqual(
      `${slugs.values.predicates[0]}-${slugs.values.objects[0]}-${slugs.values.modifiers[1]}`
    );
  });
});

describe('/api/slug', () => {
  test('returns a slug for the given index', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      body: {
        index: 125643567,
      },
    });

    // @ts-expect-error request types
    await handleSlug(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        slug: 'lateral-twill-smoke',
      })
    );
  });

  test('generate a new slug', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    // @ts-expect-error request types
    await handleSlug(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        slug: expect.stringMatching(/^([a-z]+)-([a-z]+)-([a-z]+)$/),
      })
    );
  });
});
