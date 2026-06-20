import type { Media } from '../types';

interface Props {
  label: string;
  value: string | null;
  media: Media[];
  onChange: (id: string | null) => void;
  hint?: string;
}

export default function ImagePicker({ label, value, media, onChange, hint }: Props) {
  const selected = media.find((m) => m.id === value);

  return (
    <div className="form-row image-picker">
      <label>{label}</label>
      <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">None</option>
        {media.map((m) => (
          <option key={m.id} value={m.id}>
            {m.filename}
          </option>
        ))}
      </select>
      {hint && <p className="field-hint">{hint}</p>}
      {selected ? (
        <div className="image-preview">
          <img src={selected.url} alt={selected.alt || selected.filename} />
          <div className="image-preview__meta">
            <strong>{selected.filename}</strong>
            <span>{Math.round(selected.size / 1024)} KB</span>
          </div>
        </div>
      ) : (
        <div className="image-preview image-preview--empty">No image selected</div>
      )}
    </div>
  );
}
