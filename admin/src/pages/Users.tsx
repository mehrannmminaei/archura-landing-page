import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { User } from '../types';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      api.users.list().then(setUsers).catch(console.error);
    }
  }, [currentUser]);

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this user? They will lose admin panel access.')) return;
    try {
      await api.users.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Panel Users</h2>
          <p className="field-hint">Accounts that can log in to this admin panel (editors and admins).</p>
        </div>
        <Link to="/users/new" className="btn">
          + Add User
        </Link>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Author Profile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role === 'admin' ? 'published' : 'draft'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.author?.name || '—'}</td>
                <td className="actions">
                  {user.id === currentUser?.id ? (
                    <span className="field-hint">You</span>
                  ) : (
                    <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
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
