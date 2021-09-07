declare module 'random-seedable' {
  export class MersenneTwister {
    constructor(seed: number, n: number, m: number);
    shuffle<T>(inArray: Array<T>, inPlace?: Boolean): Array<T>;
  }
}
