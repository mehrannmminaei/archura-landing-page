import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { Post } from '../types';

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    const params = filter ? { status: filter } : undefined;
    api.posts.list(params).then(setPosts).catch(console.error);
  }, [filter]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return;
    try {
      await api.posts.remove(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  function canManage(post: Post): boolean {
    if (user?.role === 'admin') return true;
    return post.authorId === user?.authorId;
  }

  return (
    <div>
      <div className="page-header">
        <h2>{user?.role === 'admin' ? 'Posts' : 'My Posts'}</h2>
        <Link to="/posts/new" className="btn">
          + New Post
        </Link>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              {user?.role === 'admin' && <th>Author</th>}
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  {canManage(post) ? (
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  ) : (
                    post.title
                  )}
                </td>
                {user?.role === 'admin' && <td>{post.author.name}</td>}
                <td>{post.category.name}</td>
                <td>
                  <span className={`badge badge-${post.status}`}>{post.status}</span>
                </td>
                <td className="actions">
                  {canManage(post) ? (
                    <>
                      <Link to={`/posts/${post.id}`} className="btn btn-secondary">
                        Edit
                      </Link>
                      <button className="btn btn-danger" onClick={() => handleDelete(post.id)}>
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="field-hint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
