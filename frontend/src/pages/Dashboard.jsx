import { useState, useEffect, useContext } from 'react';
import { Ticket, Users, CheckCircle, Clock } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {

  const { user } = useContext(AuthContext);
  const [data, setData] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    activeUsers: 0,
    recentTickets: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/tickets/dashboard/stats');
        setData(response.data);
        
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Tickets', value: data.total, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Open Issues', value: data.open, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Resolved', value: data.resolved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: user?.role === 'customer' ? 'Your Profile' : 'Active Users', value: data.activeUsers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-medium">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Overview</h1>
        <p className="text-sm text-zinc-500 mt-1">Welcome back, {user?.name}. Here is what's happening today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">{stat.title}</p>
                  <p className="text-3xl font-black text-zinc-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">Recent Tickets</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-400 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Ticket ID</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Customer Email</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.recentTickets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-zinc-500 font-medium">No recent tickets found.</td>
                </tr>
              ) : (
                data.recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-cyan-600">#{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{ticket.title}</td>
                    <td className="px-6 py-4">{ticket.customer_email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ticket.status}
                      </span>
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