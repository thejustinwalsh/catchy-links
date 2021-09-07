import { objects, predicates } from 'friendly-words';
import { MersenneTwister } from 'random-seedable';

import type { Slugs } from './slug';

const DEFAULT_SEED = 4674;
const DEFAULT_N = 624;
const DEFAULT_M = 397;

export function generate(seed = DEFAULT_SEED, generation = 0): Slugs {
  const random = new MersenneTwister(seed, DEFAULT_N, DEFAULT_M);

  const values = {
    predicates: random.shuffle(predicates, false),
    modifiers: random.shuffle(objects, false),
    objects: random.shuffle(objects, false),
  };
  const keys = {
    predicates: values.predicates.reduce((res, key, index) => {
      return { ...res, [key]: index };
    }, {}),
    modifiers: values.modifiers.reduce((res, key, index) => {
      return { ...res, [key]: index };
    }, {}),
    objects: values.objects.reduce((res, key, index) => {
      return { ...res, [key]: index };
    }, {}),
  };

  return { keys, values, generation };
}
