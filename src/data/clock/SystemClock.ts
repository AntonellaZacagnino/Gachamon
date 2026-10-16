import { Clock } from '../../domain/services/Clock';

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}
