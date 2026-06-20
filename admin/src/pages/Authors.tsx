import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { Author } from '../types';

export default function Authors() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    api.authors.list().then(setAuthors).catch(console.error);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this author?')) return;
    await api.authors.remove(id);
    setAuthors((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Manage Authors</h2>
          <p className="field-hint">Public author profiles shown on blog posts and author pages.</p>
        </div>
        {isAdmin && (
          <Link to="/authors/new" className="btn">
            + New Author
          </Link>
        )}
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Title</th>
              <th>Posts</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                <td>
                  {author.avatar ? (
                    <img src={author.avatar.url} alt="" className="table-avatar" />
                  ) : (
                    <span className="table-avatar table-avatar--empty">—</span>
                  )}
                </td>
                <td>
                  {isAdmin ? (
                    <Link to={`/authors/${author.id}`}>{author.name}</Link>
                  ) : (
                    author.name
                  )}
                </td>
                <td>{author.slug}</td>
                <td>{author.title || '—'}</td>
                <td>{author._count?.posts ?? 0}</td>
                {isAdmin && (
                  <td className="actions">
                    <Link to={`/authors/${author.id}`} className="btn btn-secondary">
                      Edit
                    </Link>
                    <button className="btn btn-danger" onClick={() => handleDelete(author.id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
