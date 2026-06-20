import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Archura Blog</h1>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/posts">Posts</NavLink>
          {isAdmin && <NavLink to="/authors">Manage Authors</NavLink>}
          {isAdmin && <NavLink to="/categories">Categories</NavLink>}
          <NavLink to="/media">Media Library</NavLink>
          {isAdmin && <NavLink to="/users">Panel Users</NavLink>}
        </nav>
        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
          <p>{user?.name}</p>
          <p>{user?.role}</p>
          {user?.author && <p>Profile: {user.author.name}</p>}
          <button className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
