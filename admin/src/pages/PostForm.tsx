import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import RichTextEditor from '../components/RichTextEditor';
import ImagePicker from '../components/ImagePicker';
import SeoPanel, { OgImagePicker } from '../components/SeoPanel';
import type { Author, Category, Media } from '../types';

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAuthorLike = user?.role === 'author' || user?.role === 'editor';
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [authorId, setAuthorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [seoOgTitle, setSeoOgTitle] = useState('');
  const [seoOgDescription, setSeoOgDescription] = useState('');
  const [seoOgImageId, setSeoOgImageId] = useState<string | null>(null);
  const [seoCanonicalUrl, setSeoCanonicalUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    Promise.all([api.authors.list(), api.categories.list(), api.media.list('image')]).then(
      ([a, c, m]) => {
        setAuthors(a);
        setCategories(c);
        setMedia(m);
        if (isNew && isAdmin && a.length) setAuthorId(a[0].id);
        if (isNew && isAuthorLike && user?.authorId) setAuthorId(user.authorId);
        if (isNew && c.length) setCategoryId(c[0].id);
      },
    );

    if (!isNew && id) {
      api.posts.list().then((posts) => {
        const post = posts.find((p) => p.id === id);
        if (!post) return;
        if (!isAdmin && post.authorId !== user?.authorId) {
          setForbidden(true);
          return;
        }
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || '');
        setContent(post.content);
        setStatus(post.status);
        setAuthorId(post.authorId);
        setCategoryId(post.categoryId);
        setCoverImageId(post.coverImageId);
        setSeoMetaTitle(post.seoMetaTitle || '');
        setSeoMetaDescription(post.seoMetaDescription || '');
        setSeoOgTitle(post.seoOgTitle || '');
        setSeoOgDescription(post.seoOgDescription || '');
        setSeoOgImageId(post.seoOgImageId);
        setSeoCanonicalUrl(post.seoCanonicalUrl || '');
        setPublishedAt(post.publishedAt);
        setUpdatedAt(post.updatedAt);
      });
    }
  }, [id, isNew, isAdmin, isAuthorLike, user?.authorId]);

  if (forbidden) {
    return <Navigate to="/posts" replace />;
  }

  function handleSeoChange(fields: Partial<{
    seoMetaTitle: string;
    seoMetaDescription: string;
    seoOgTitle: string;
    seoOgDescription: string;
    seoOgImageId: string | null;
    seoCanonicalUrl: string;
  }>) {
    if (fields.seoMetaTitle !== undefined) setSeoMetaTitle(fields.seoMetaTitle);
    if (fields.seoMetaDescription !== undefined) setSeoMetaDescription(fields.seoMetaDescription);
    if (fields.seoOgTitle !== undefined) setSeoOgTitle(fields.seoOgTitle);
    if (fields.seoOgDescription !== undefined) setSeoOgDescription(fields.seoOgDescription);
    if (fields.seoOgImageId !== undefined) setSeoOgImageId(fields.seoOgImageId);
    if (fields.seoCanonicalUrl !== undefined) setSeoCanonicalUrl(fields.seoCanonicalUrl);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      title,
      slug: slug || undefined,
      excerpt,
      content,
      status,
      authorId,
      categoryId,
      coverImageId,
      seoMetaTitle,
      seoMetaDescription,
      seoOgTitle,
      seoOgDescription,
      seoOgImageId,
      seoCanonicalUrl,
    };
    try {
      if (isNew) await api.posts.create(body);
      else await api.posts.update(id!, body);
      navigate('/posts');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const selectedAuthor = authors.find((a) => a.id === authorId) || null;

  return (
    <div>
      <div className="page-header">
        <h2>{isNew ? 'New Post' : 'Edit Post'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="card form-grid">
        <div className="form-row">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
        </div>
        <div className="form-row">
          <label>Excerpt</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary used in listings and SEO" />
        </div>

        <RichTextEditor
          label="Content"
          value={content}
          onChange={setContent}
          media={media}
          onMediaUploaded={(item) => {
            setMedia((prev) => [item, ...prev]);
          }}
        />

        <div className="form-row">
          <label>Author</label>
          {isAdmin ? (
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} required>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              value={authors.find((a) => a.id === authorId)?.name || user?.author?.name || ''}
              readOnly
              disabled
            />
          )}
        </div>
        <div className="form-row">
          <label>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <ImagePicker
          label="Cover Image"
          value={coverImageId}
          media={media}
          onChange={setCoverImageId}
          hint="Shown at the top of the post page — not inside the article body."
        />

        <div className="form-row">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <span className="field-hint">Only published posts are built into the public site.</span>
        </div>

        <SeoPanel
          title={title}
          slug={slug}
          excerpt={excerpt}
          coverImageId={coverImageId}
          seoMetaTitle={seoMetaTitle}
          seoMetaDescription={seoMetaDescription}
          seoOgTitle={seoOgTitle}
          seoOgDescription={seoOgDescription}
          seoOgImageId={seoOgImageId}
          seoCanonicalUrl={seoCanonicalUrl}
          publishedAt={publishedAt}
          updatedAt={updatedAt}
          author={selectedAuthor}
          media={media}
          onChange={handleSeoChange}
        />

        <OgImagePicker value={seoOgImageId} media={media} onChange={setSeoOgImageId} />

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Post'}
        </button>
      </form>
    </div>
  );
}
