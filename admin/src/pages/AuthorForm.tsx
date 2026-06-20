import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import RichTextEditor from '../components/RichTextEditor';
import type { Media } from '../types';

export default function AuthorForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.media.list('image').then(setMedia).catch(console.error);
    if (!isNew && id) {
      api.authors.list().then((authors) => {
        const author = authors.find((a) => a.id === id);
        if (author) {
          setName(author.name);
          setSlug(author.slug);
          setTitle(author.title || '');
          setBio(author.bio || '');
          setAvatarId(author.avatarId);
          setSocialLinks(author.socialLinks || []);
          setSeoMetaTitle(author.seoMetaTitle || '');
          setSeoMetaDescription(author.seoMetaDescription || '');
        }
      });
    }
  }, [id, isNew]);

  if (user?.role !== 'admin') {
    return <Navigate to="/authors" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name,
      slug: slug || undefined,
      title,
      bio,
      avatarId,
      socialLinks,
      seoMetaTitle,
      seoMetaDescription,
    };
    try {
      if (isNew) await api.authors.create(body);
      else await api.authors.update(id!, body);
      navigate('/authors');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>{isNew ? 'New Author' : 'Edit Author'}</h2>
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
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SEO Specialist" />
        </div>
        <RichTextEditor label="Bio" value={bio} onChange={setBio} />
        <div className="form-row">
          <label>Profile Photo</label>
          <select value={avatarId || ''} onChange={(e) => setAvatarId(e.target.value || null)}>
            <option value="">None</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.filename}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <h3>Social Links</h3>
          {socialLinks.map((link, i) => (
            <div key={i} className="social-row">
              <input
                placeholder="Platform"
                value={link.platform}
                onChange={(e) => {
                  const next = [...socialLinks];
                  next[i] = { ...next[i], platform: e.target.value };
                  setSocialLinks(next);
                }}
              />
              <input
                placeholder="URL"
                value={link.url}
                onChange={(e) => {
                  const next = [...socialLinks];
                  next[i] = { ...next[i], url: e.target.value };
                  setSocialLinks(next);
                }}
              />
              <button type="button" className="btn btn-danger" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => setSocialLinks([...socialLinks, { platform: '', url: '' }])}>
            Add Link
          </button>
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
        </div>

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Author'}
        </button>
      </form>
    </div>
  );
}
