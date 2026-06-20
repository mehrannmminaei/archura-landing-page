import slugify from 'slugify';

export function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true });
}

export function uniqueSlug(base: string, existing: string[]): string {
  let slug = toSlug(base);
  let counter = 1;
  while (existing.includes(slug)) {
    slug = `${toSlug(base)}-${counter}`;
    counter += 1;
  }
  return slug;
}
