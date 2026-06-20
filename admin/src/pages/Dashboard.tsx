import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { DashboardData } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error);
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  const { stats, recentPosts } = data;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <Link to="/posts/new" className="btn">
          + New Post
        </Link>
      </div>

      <div className="card-grid">
        <div className="card stat-card">
          <h3>{stats.postsTotal}</h3>
          <p>{isAdmin ? 'Total Posts' : 'My Posts'}</p>
        </div>
        <div className="card stat-card">
          <h3>{stats.publishedCount}</h3>
          <p>Published</p>
        </div>
        <div className="card stat-card">
          <h3>{stats.draftCount}</h3>
          <p>Drafts</p>
        </div>
        {isAdmin && (
          <>
            <div className="card stat-card">
              <h3>{stats.authorsTotal}</h3>
              <p>Authors</p>
            </div>
            <div className="card stat-card">
              <h3>{stats.categoriesTotal}</h3>
              <p>Categories</p>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>{isAdmin ? 'Recent Posts' : 'My Recent Posts'}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              {isAdmin && <th>Author</th>}
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentPosts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </td>
                {isAdmin && <td>{post.author.name}</td>}
                <td>{post.category.name}</td>
                <td>
                  <span className={`badge badge-${post.status}`}>{post.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
