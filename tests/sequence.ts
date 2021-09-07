import { seed, get } from '../lib/sequence';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDistinct: (expected: Array<unknown>) => CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeDistinct(received) {
    const pass =
      Array.isArray(received) && new Set(received).size === received.length;
    if (pass) {
      return {
        message: () => `expected [${received}] array is unique`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected [${received}] array is not unique`,
        pass: false,
      };
    }
  },
});

describe('/utils/sequence', () => {
  test('sequence is unique', async () => {
    let s = Math.pow(2, 32) - 1;
    const sequence = [...Array(100)].map(() => get(s++, 3975739));

    expect(sequence).toBeDistinct(sequence);
  });

  test('sequence wraps at 2^32', async () => {
    const min = get(0);
    const max = get(Math.pow(2, 32) - 1);
    const overflow = get(Math.pow(2, 32));

    expect(min).not.toEqual(max);
    expect(max).not.toEqual(overflow);
    expect(overflow).toEqual(min);
  });
});
