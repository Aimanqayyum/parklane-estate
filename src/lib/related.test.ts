import { describe, it, expect } from 'vitest';
import { pickRelated } from './related';

const p = (id: string, purpose: string, category: string) => ({ id, purpose, category });

describe('pickRelated', () => {
  const current = p('cur', 'rent', 'flat');

  it('only keeps the same purpose', () => {
    const out = pickRelated(current, [p('a', 'sale', 'flat'), p('b', 'rent', 'flat')], 4);
    expect(out.map((x) => x.id)).toEqual(['b']);
  });

  it('puts the same category first, keeping the original order otherwise', () => {
    const out = pickRelated(
      current,
      [p('a', 'rent', 'shop'), p('b', 'rent', 'flat'), p('c', 'rent', 'office'), p('d', 'rent', 'flat')],
      4
    );
    expect(out.map((x) => x.id)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('never includes the current property', () => {
    expect(pickRelated(current, [p('cur', 'rent', 'flat'), p('b', 'rent', 'flat')], 4).map((x) => x.id)).toEqual(['b']);
  });

  it('limits the result', () => {
    const many = ['a', 'b', 'c', 'd', 'e'].map((id) => p(id, 'rent', 'flat'));
    expect(pickRelated(current, many, 3)).toHaveLength(3);
  });

  it('is empty when nothing matches', () => {
    expect(pickRelated(current, [p('a', 'sale', 'flat')], 4)).toEqual([]);
  });
});
