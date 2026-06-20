import { useRef } from 'react';
import { api } from '../api';
import type { Media } from '../types';

interface Props {
  open: boolean;
  media: Media[];
  onClose: () => void;
  onSelect: (item: Media) => void;
  onUploaded?: (item: Media) => void;
}

export default function MediaPickerModal({ open, media, onClose, onSelect, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  async function handleUpload(files: FileList | null) {
    if (!files?.[0]) return;
    try {
      const item = await api.media.upload(files[0]);
      onUploaded?.(item);
      onSelect(item);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select Image</h3>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div
          className="upload-zone"
          style={{ marginBottom: '1rem' }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files)}
          />
          Upload new image
        </div>

        <div className="media-grid">
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              className="media-pick-item"
              onClick={() => onSelect(item)}
            >
              <img src={item.url} alt={item.alt || item.filename} />
              <span>{item.filename}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
