import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function UserForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'author'>('author');
  const [authorId, setAuthorId] = useState('');
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    api.authors.list().then(setAuthors).catch(console.error);
  }, [user, navigate]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.users.create({
        name,
        email,
        password,
        role,
        authorId: role === 'author' ? authorId : null,
      });
      navigate('/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Add Panel User</h2>
      </div>
      <form onSubmit={handleSubmit} className="card form-grid">
        <div className="form-row">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <span className="field-hint">Minimum 8 characters</span>
        </div>
        <div className="form-row">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'author')}>
            <option value="author">Author — posts, media, own content only</option>
            <option value="admin">Admin — full access</option>
          </select>
        </div>
        {role === 'author' && (
          <div className="form-row">
            <label>Linked Author Profile</label>
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} required>
              <option value="">Select author profile...</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <span className="field-hint">Posts created by this user will use this public author profile.</span>
          </div>
        )}
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}
