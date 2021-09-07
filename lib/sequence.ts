function permuteQPR(x: number) {
  const prime = 4294967291;
  const halfPrime = 2147483645;
  if (x >= prime) return x; // The 5 integers out of range are mapped to themselves.

  // squaring can cause exceeding 2^53
  const residue = Number((BigInt(x) * BigInt(x)) % BigInt(prime));
  return x <= halfPrime ? residue : prime - residue;
}

/**
 * Generate a starting index for the sequence
 * @param seedBase Starting base value
 * @returns starting index for the sequence generator get function
 */
export function seed(seedBase = 1) {
  return permuteQPR(permuteQPR(seedBase) + 0x682f0161);
}

/**
 *
 * @param index Number to transform in the sequence
 * @param intermediateOffset offset the sequence to create bigger initial variance
 * @returns new permuted number in the sequence (do not feed back into index for linear sequence)
 */
export function get(index: number, intermediateOffset = 0) {
  return permuteQPR(
    ((permuteQPR(index) + intermediateOffset) ^ 0x5bf03635) >>> 0
  );
}
