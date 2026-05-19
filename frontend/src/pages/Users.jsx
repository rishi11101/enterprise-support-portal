import { useState, useEffect, useContext } from 'react';
import { Shield, User as UserIcon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Users() {
  const { user: currentUser } = useContext(AuthContext); 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert("Failed to update role. Ensure you have Admin privileges.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">User Management</h1>
        <p className="text-sm text-zinc-500 mt-1">View the directory and manage staff/admin privileges.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-400 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-zinc-500 font-medium">Loading directory...</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900 flex items-center gap-3">
                      <div className="bg-zinc-100 p-2 rounded-full">
                        {u.role === 'admin' ? <Shield className="w-4 h-4 text-cyan-600" /> : <UserIcon className="w-4 h-4 text-zinc-400" />}
                      </div>
                      {u.name}
                      {currentUser?.id === u.id && (
                        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full ml-2">You</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      {/* Check if logged in user is an admin & if it's not trying to change own role */}
                      {currentUser?.role === 'admin' && currentUser?.id !== u.id ? (
                        <select 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm bg-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none cursor-pointer"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="capitalize font-medium px-3 py-1.5 inline-block">{u.role}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}