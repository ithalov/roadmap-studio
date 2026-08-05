import { describe, expect, it } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', undefined, 'px-4')).toBe('px-4');
  });
});
