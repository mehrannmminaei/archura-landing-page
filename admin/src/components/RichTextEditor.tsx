import { useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import MediaPickerModal from './MediaPickerModal';
import type { Media } from '../types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  media?: Media[];
  onMediaUploaded?: (item: Media) => void;
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  media = [],
  onMediaUploaded,
}: Props) {
  const quillRef = useRef<ReactQuill>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  function insertImage(item: Media) {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    editor.insertEmbed(index, 'image', item.url);
    editor.setSelection(index + 1);
    setPickerOpen(false);
  }

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'blockquote'],
          ['clean'],
        ],
        handlers: {
          image: () => setPickerOpen(true),
        },
      },
    }),
    [],
  );

  return (
    <div className="form-row">
      {label && <label>{label}</label>}
      <p className="field-hint">
        Use the image button in the toolbar to insert photos inside the article (separate from cover image).
      </p>
      <div className="quill-editor">
        <ReactQuill ref={quillRef} theme="snow" value={value} onChange={onChange} modules={modules} />
      </div>
      <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={() => setPickerOpen(true)}>
        Insert image from library
      </button>
      <MediaPickerModal
        open={pickerOpen}
        media={media}
        onClose={() => setPickerOpen(false)}
        onSelect={insertImage}
        onUploaded={onMediaUploaded}
      />
    </div>
  );
}
