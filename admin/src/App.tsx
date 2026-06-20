import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Authors from './pages/Authors';
import AuthorForm from './pages/AuthorForm';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Posts from './pages/Posts';
import PostForm from './pages/PostForm';
import MediaLibrary from './pages/MediaLibrary';
import Users from './pages/Users';
import UserForm from './pages/UserForm';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="authors" element={<Authors />} />
                  <Route path="authors/new" element={<AuthorForm />} />
                  <Route path="authors/:id" element={<AuthorForm />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="categories/new" element={<CategoryForm />} />
                  <Route path="categories/:id" element={<CategoryForm />} />
                  <Route path="posts" element={<Posts />} />
                  <Route path="posts/new" element={<PostForm />} />
                  <Route path="posts/:id" element={<PostForm />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="users" element={<Users />} />
                  <Route path="users/new" element={<UserForm />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
