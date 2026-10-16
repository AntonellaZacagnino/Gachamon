import { formatCountdown } from '../../src/shared/utils/formatDuration';

describe('formatCountdown', () => {
  it.each([
    [0, '0:00'],
    [1, '0:01'],
    [59_000, '0:59'],
    [60_000, '1:00'],
    [272_000, '4:32'],
    [10 * 60_000, '10:00'],
    [3_725_000, '1:02:05'],
  ])('%p ms -> %p', (ms, text) => {
    expect(formatCountdown(ms)).toBe(text);
  });

  it('rounds up so it never shows 0:00 while time remains', () => {
    expect(formatCountdown(100)).toBe('0:01');
  });

  it('never shows a negative time', () => {
    expect(formatCountdown(-5000)).toBe('0:00');
  });
});
