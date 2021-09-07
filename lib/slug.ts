export type Slugs = {
  values: {
    predicates: Array<string>;
    modifiers: Array<string>;
    objects: Array<string>;
  };
  keys: {
    predicates: Record<string, number>;
    modifiers: Record<string, number>;
    objects: Record<string, number>;
  };
  generation: number;
};

export function getSlugByIndex(index: number, slugs: Slugs) {
  const { predicates, objects, modifiers } = slugs.values;

  const pIndex = Math.floor(
    Math.floor(index / objects.length) / modifiers.length
  );
  const mIndex = Math.floor(index / objects.length) % modifiers.length;
  const oIndex = index % objects.length;

  return `${predicates[pIndex]}-${objects[oIndex]}-${modifiers[mIndex]}`;
}

export function getIndexBySlug(slug: string, slugs: Slugs) {
  const { predicates, objects, modifiers } = slugs.keys;
  const [p, o, m] = slug.split('-');

  const pIndex = predicates[p];
  const mIndex = modifiers[m];
  const oIndex = objects[o];

  return (
    pIndex * slugs.values.modifiers.length * slugs.values.objects.length +
    mIndex * slugs.values.objects.length +
    oIndex
  );
}
