import { useMemo } from 'react';
import { buildPostJsonLd } from '../lib/postJsonLd';
import type { Author, Media } from '../types';

const SITE_NAME = 'Archura Media';
const SITE_URL = 'https://www.archuramedia.com';

interface Props {
  title: string;
  slug: string;
  excerpt: string;
  coverImageId: string | null;
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoOgTitle: string;
  seoOgDescription: string;
  seoOgImageId: string | null;
  seoCanonicalUrl: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  author?: Author | null;
  media: Media[];
  onChange: (fields: Partial<{
    seoMetaTitle: string;
    seoMetaDescription: string;
    seoOgTitle: string;
    seoOgDescription: string;
    seoOgImageId: string | null;
    seoCanonicalUrl: string;
  }>) => void;
}

function charCount(text: string, ideal: number): string {
  const len = text.length;
  if (len === 0) return `0 / ~${ideal}`;
  if (len <= ideal) return `${len} / ~${ideal} ✓`;
  if (len <= ideal + 20) return `${len} / ~${ideal} (slightly long)`;
  return `${len} / ~${ideal} (too long)`;
}

export default function SeoPanel({
  title,
  slug,
  excerpt,
  coverImageId,
  seoMetaTitle,
  seoMetaDescription,
  seoOgTitle,
  seoOgDescription,
  seoOgImageId,
  seoCanonicalUrl,
  publishedAt,
  updatedAt,
  author,
  media,
  onChange,
}: Props) {
  const postSlug = slug || title.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
  const coverImage = media.find((m) => m.id === coverImageId) || null;
  const seoOgImage = media.find((m) => m.id === seoOgImageId) || null;

  const jsonLd = useMemo(
    () =>
      buildPostJsonLd({
        title,
        slug: postSlug,
        excerpt,
        seoMetaTitle,
        seoMetaDescription,
        seoCanonicalUrl,
        seoOgImage,
        coverImage,
        publishedAt: publishedAt || null,
        updatedAt: updatedAt || null,
        author: author || { name: 'Author', slug: 'author' },
      }),
    [
      title,
      postSlug,
      excerpt,
      seoMetaTitle,
      seoMetaDescription,
      seoCanonicalUrl,
      seoOgImage,
      coverImage,
      publishedAt,
      updatedAt,
      author,
    ],
  );

  const presets = [
    {
      label: 'Meta title from post title',
      apply: () => onChange({ seoMetaTitle: `${title} | ${SITE_NAME} Blog` }),
    },
    {
      label: 'Meta description from excerpt',
      apply: () => onChange({ seoMetaDescription: excerpt.slice(0, 160) }),
    },
    {
      label: 'OG title = meta title',
      apply: () => onChange({ seoOgTitle: seoMetaTitle || `${title} | ${SITE_NAME} Blog` }),
    },
    {
      label: 'OG description = meta description',
      apply: () => onChange({ seoOgDescription: seoMetaDescription || excerpt.slice(0, 160) }),
    },
    {
      label: 'OG image = cover image',
      apply: () => onChange({ seoOgImageId: coverImageId }),
    },
    {
      label: 'Canonical URL from slug',
      apply: () => onChange({ seoCanonicalUrl: `${SITE_URL}/blog/${postSlug}/` }),
    },
  ];

  function fillAll() {
    onChange({
      seoMetaTitle: `${title} | ${SITE_NAME} Blog`,
      seoMetaDescription: excerpt.slice(0, 160),
      seoOgTitle: `${title} | ${SITE_NAME} Blog`,
      seoOgDescription: excerpt.slice(0, 160),
      seoOgImageId: coverImageId,
      seoCanonicalUrl: `${SITE_URL}/blog/${postSlug}/`,
    });
  }

  return (
    <div className="form-section seo-panel">
      <div className="seo-panel__header">
        <h3>SEO Settings</h3>
        <button type="button" className="btn btn-secondary" onClick={fillAll}>
          Auto-fill all SEO fields
        </button>
      </div>

      <div className="seo-presets">
        <p className="field-hint">Quick fill — click to apply:</p>
        <div className="seo-presets__list">
          {presets.map((preset) => (
            <button key={preset.label} type="button" className="seo-preset-btn" onClick={preset.apply}>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <label>Meta Title</label>
        <input
          value={seoMetaTitle}
          onChange={(e) => onChange({ seoMetaTitle: e.target.value })}
          placeholder={`${title} | ${SITE_NAME} Blog`}
        />
        <span className={`char-count ${seoMetaTitle.length > 60 ? 'char-count--warn' : ''}`}>
          {charCount(seoMetaTitle, 60)}
        </span>
      </div>

      <div className="form-row">
        <label>Meta Description</label>
        <textarea
          value={seoMetaDescription}
          onChange={(e) => onChange({ seoMetaDescription: e.target.value })}
          placeholder="Short summary for Google search results (150–160 characters)"
        />
        <span className={`char-count ${seoMetaDescription.length > 160 ? 'char-count--warn' : ''}`}>
          {charCount(seoMetaDescription, 160)}
        </span>
      </div>

      <div className="form-row">
        <label>OG Title</label>
        <input
          value={seoOgTitle}
          onChange={(e) => onChange({ seoOgTitle: e.target.value })}
          placeholder="Title for Facebook / LinkedIn shares"
        />
      </div>

      <div className="form-row">
        <label>OG Description</label>
        <textarea
          value={seoOgDescription}
          onChange={(e) => onChange({ seoOgDescription: e.target.value })}
          placeholder="Description for social media previews"
        />
      </div>

      <div className="form-row">
        <label>Canonical URL</label>
        <input
          value={seoCanonicalUrl}
          onChange={(e) => onChange({ seoCanonicalUrl: e.target.value })}
          placeholder={`${SITE_URL}/blog/${postSlug}/`}
        />
      </div>

      <div className="seo-preview card">
        <p className="field-hint">Google preview</p>
        <div className="seo-preview__google">
          <div className="seo-preview__title">
            {seoMetaTitle || `${title} | ${SITE_NAME} Blog`}
          </div>
          <div className="seo-preview__url">{seoCanonicalUrl || `${SITE_URL}/blog/${postSlug}/`}</div>
          <div className="seo-preview__desc">
            {seoMetaDescription || excerpt || 'Add a meta description for better click-through rates.'}
          </div>
        </div>
      </div>

      <div className="seo-preview card">
        <p className="field-hint">Schema.org JSON-LD (auto-generated on save)</p>
        <pre className="json-ld-preview">{JSON.stringify(jsonLd, null, 2)}</pre>
      </div>
    </div>
  );
}

export function OgImagePicker({
  value,
  media,
  onChange,
}: {
  value: string | null;
  media: Media[];
  onChange: (id: string | null) => void;
}) {
  return (
    <ImagePickerInline label="OG Image" value={value} media={media} onChange={onChange} />
  );
}

function ImagePickerInline({
  label,
  value,
  media,
  onChange,
}: {
  label: string;
  value: string | null;
  media: Media[];
  onChange: (id: string | null) => void;
}) {
  const selected = media.find((m) => m.id === value);
  return (
    <div className="form-row image-picker">
      <label>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">None (use cover image on frontend)</option>
        {media.map((m) => (
          <option key={m.id} value={m.id}>
            {m.filename}
          </option>
        ))}
      </select>
      {selected && (
        <div className="image-preview image-preview--sm">
          <img src={selected.url} alt={selected.alt || selected.filename} />
        </div>
      )}
    </div>
  );
}
