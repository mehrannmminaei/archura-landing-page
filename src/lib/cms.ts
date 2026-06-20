export type {
  SerializedAuthor as Author,
  SerializedCategory as Category,
  SerializedPost as Post,
} from '../../api/src/lib/cms-data.js';

export {
  getAuthor,
  getCategory,
  getPublishedPosts,
  getPost,
  getRelatedPosts,
  getAuthors,
  getCategories,
} from '../../api/src/lib/cms-data.js';

export function formatDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
