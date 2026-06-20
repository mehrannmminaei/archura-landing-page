import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { Media } from '../types';

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function load() {
    api.media.list(filter || undefined).then(setMedia).catch(console.error);
  }

  useEffect(() => {
    load();
  }, [filter]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await api.media.upload(file);
      }
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this media file?')) return;
    await api.media.remove(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <h2>Media Library</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      <div
        className="upload-zone card"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files)}
        />
        {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
      </div>

      <div className="media-grid">
        {media.map((item) => (
          <div key={item.id} className="media-item">
            {item.type === 'video' ? (
              <video src={item.url} controls />
            ) : (
              <img src={item.url} alt={item.alt || item.filename} />
            )}
            <div className="media-item-info">
              <p>{item.filename}</p>
              <p>{item.type} · {(item.size / 1024).toFixed(0)} KB</p>
              <button className="btn btn-danger" style={{ marginTop: '0.25rem', width: '100%' }} onClick={() => handleDelete(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
