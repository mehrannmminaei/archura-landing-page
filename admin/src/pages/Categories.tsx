import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.categories.list().then(setCategories).catch(console.error);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return;
    await api.categories.remove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <h2>Categories</h2>
        <Link to="/categories/new" className="btn">
          + New Category
        </Link>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Posts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <Link to={`/categories/${cat.id}`}>{cat.name}</Link>
                </td>
                <td>{cat.slug}</td>
                <td>{cat._count?.posts ?? 0}</td>
                <td className="actions">
                  <Link to={`/categories/${cat.id}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button className="btn btn-danger" onClick={() => handleDelete(cat.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
