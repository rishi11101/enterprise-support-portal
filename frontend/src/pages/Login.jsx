import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/users/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);

      setUser(response.data.user);

      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong logging in.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-white">Enterprise Support</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to access the portal</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="admin@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all"
          >
            Sign In
          </button>
        </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
              Sign up
            </Link>
          </p>

      </div>
    </div>
  );
}