import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import type { Media } from '../types';

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageId, setCoverImageId] = useState<string | null>(null);
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [seoOgImageId, setSeoOgImageId] = useState<string | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.media.list('image').then(setMedia).catch(console.error);
    if (!isNew && id) {
      api.categories.list().then((categories) => {
        const cat = categories.find((c) => c.id === id);
        if (cat) {
          setName(cat.name);
          setSlug(cat.slug);
          setDescription(cat.description || '');
          setCoverImageId(cat.coverImageId);
          setSeoMetaTitle(cat.seoMetaTitle || '');
          setSeoMetaDescription(cat.seoMetaDescription || '');
          setSeoOgImageId(cat.seoOgImageId);
        }
      });
    }
  }, [id, isNew]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name,
      slug: slug || undefined,
      description,
      coverImageId,
      seoMetaTitle,
      seoMetaDescription,
      seoOgImageId,
    };
    try {
      if (isNew) await api.categories.create(body);
      else await api.categories.update(id!, body);
      navigate('/categories');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>{isNew ? 'New Category' : 'Edit Category'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="card form-grid">
        <div className="form-row">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated" />
        </div>
        <div className="form-row">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-row">
          <label>Cover Image</label>
          <select value={coverImageId || ''} onChange={(e) => setCoverImageId(e.target.value || null)}>
            <option value="">None</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.filename}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <h3>SEO</h3>
          <div className="form-row">
            <label>Meta Title</label>
            <input value={seoMetaTitle} onChange={(e) => setSeoMetaTitle(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Meta Description</label>
            <textarea value={seoMetaDescription} onChange={(e) => setSeoMetaDescription(e.target.value)} />
          </div>
          <div className="form-row">
            <label>OG Image</label>
            <select value={seoOgImageId || ''} onChange={(e) => setSeoOgImageId(e.target.value || null)}>
              <option value="">None</option>
              {media.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.filename}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Category'}
        </button>
      </form>
    </div>
  );
}
