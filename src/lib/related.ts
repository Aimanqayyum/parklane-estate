interface HasPurposeCategory {
  id: string;
  purpose: string;
  category: string;
}

/**
 * Related properties for a detail page: same purpose only (a rent listing
 * should not suggest sale ones), same category first, then the rest in their
 * original order.
 */
export function pickRelated<T extends HasPurposeCategory>(
  current: HasPurposeCategory,
  candidates: T[],
  limit: number,
): T[] {
  const samePurpose = candidates.filter((c) => c.id !== current.id && c.purpose === current.purpose);
  const sameCategory = samePurpose.filter((c) => c.category === current.category);
  const others = samePurpose.filter((c) => c.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
}
