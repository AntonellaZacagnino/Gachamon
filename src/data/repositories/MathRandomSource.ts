import { RandomSource } from '../../domain/services/RandomSource';

export class MathRandomSource implements RandomSource {
  next(): number {
    return Math.random();
  }
}
