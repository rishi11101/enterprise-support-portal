import { useState, useEffect, useContext, useRef } from 'react';
import { Search, Plus, X, CheckCircle, Clock, Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../api/axios';

const socket = io(import.meta.env.VITE_API_URL.replace('/api', '') || "http://localhost:5000");

export default function Tickets() {

  const { user: currentUser } = useContext(AuthContext); // Need to know who is typing

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Chat states
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');

  const messagesEndRef = useRef(null); // To auto-scroll to latest message

  const [staffList, setStaffList] = useState([]);

  // fetching dynamically on searchQuery & statusfilter
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Pass search and status as query parameters
        const response = await api.get('/tickets', {
          params: { search: searchQuery, status: statusFilter }
        });
        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce fn to avoid spamming the db on every single keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchTickets();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/tickets', formData);
      setTickets([response.data, ...tickets]);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleToggleStatus = async (ticketId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
    try {
      await api.put(`/tickets/${ticketId}`, { status: newStatus });
      
      setTickets(tickets.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Fetch replies and join socket room when a ticket is clicked
  useEffect(() => {
    if (selectedTicket) {

      api.get(`/tickets/${selectedTicket.id}/replies`).then(res => setReplies(res.data));
      
      socket.emit('join_ticket', selectedTicket.id);

      socket.on('receive_reply', (newReply) => {
        setReplies((prev) => [...prev, newReply]);
      });

      return () => {
        socket.off('receive_reply');
      };
    }
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);


  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) return;

    try {
      await api.post(`/tickets/${selectedTicket.id}/replies`, { message: replyText });
      setReplyText('');

    } catch (error) {
      console.error("Failed to send reply");
    }
  };


  // staff list for the dropdown
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      api.get('/users/staff').then(res => setStaffList(res.data)).catch(console.error);
    }
  }, [currentUser]);

  const handleAssignStaff = async (ticketId, staffId) => {

    const assignedValue = staffId === "" ? null : staffId; 
    try {
      await api.put(`/tickets/${ticketId}/assign`, { staff_id: assignedValue });
      
      setTickets(tickets.map(t => 
        t.id === ticketId ? { ...t, staff_id: assignedValue } : t
      ));
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, staff_id: assignedValue });
      }
    } catch (error) {
      console.error("Failed to assign ticket", error);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">All Tickets</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and resolve customer issues.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by title or customer..." 
            className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-400 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Ticket ID</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-500 font-medium">Loading tickets...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-zinc-500 font-medium">No tickets found.</td></tr>
              ) : (
                tickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-cyan-600">#{ticket.id}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900">{ticket.title}</td>
                    <td className="px-6 py-4">{ticket.customer_email || ticket.customer_name || `User ID: ${ticket.customer_id}`}</td>
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

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 className="text-xl font-bold text-zinc-900">Ticket #{selectedTicket.id}</h2>
              <button onClick={() => setSelectedTicket(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{selectedTicket.title}</h3>
                <p className="text-sm text-zinc-500 mt-1">Reported by: <span className="font-medium text-zinc-900">{selectedTicket.customer_email || selectedTicket.customer_name}</span></p>
              </div>
              
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 min-h-25">
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{selectedTicket.description || "No description provided."}</p>
              </div>

              {/* Chat Thread*/}
              <div className="flex flex-col h-64 border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50/50">
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {replies.length === 0 ? (
                    <p className="text-center text-sm text-zinc-400 mt-4">No replies yet. Start the conversation.</p>
                  ) : (
                    replies.map(reply => (
                      <div key={reply.id} className={`flex flex-col ${reply.user_id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-bold text-zinc-700">{reply.author_name}</span>
                          <span className="text-[10px] font-semibold uppercase text-cyan-600">{reply.author_role}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-sm max-w-[85%] shadow-sm ${
                          reply.user_id === currentUser?.id 
                            ? 'bg-cyan-600 text-white rounded-br-none' 
                            : 'bg-white border border-zinc-200 text-zinc-800 rounded-bl-none'
                        }`}>
                          {reply.message}
                        </div>
                      </div>
                    ))
                  )}

                  <div ref={messagesEndRef} />

                </div>

                {/* Input Area */}
                <form onSubmit={handleSendReply} className="flex items-center gap-2 p-3 bg-white border-t border-zinc-200">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply..." 
                    className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-cyan-500 outline-none"
                  />
                  <button type="submit" disabled={!replyText.trim()} className="bg-cyan-600 text-white p-2 rounded-lg hover:bg-cyan-500 disabled:opacity-50 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Assign to & status toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center space-x-2">

                    <span className="text-sm font-medium text-zinc-500">Status:</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedTicket.status}
                    </span>
                  </div>

                  {/* Assign to Dropdown */}
                  {currentUser?.role === 'admin' && (
                    <div className="flex items-center space-x-2 sm:ml-4 sm:pl-4 sm:border-l border-zinc-200">
                      <span className="text-sm font-medium text-zinc-500">Assign To:</span>
                      <select 
                        value={selectedTicket.staff_id || ""} 
                        onChange={(e) => handleAssignStaff(selectedTicket.id, e.target.value)}
                        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm focus:border-cyan-500 outline-none cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                {/* Toggle Status Button */}
                <button 
                  onClick={() => handleToggleStatus(selectedTicket.id, selectedTicket.status)}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedTicket.status === 'open' 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                    : 'bg-amber-500 hover:bg-amber-400 text-white'
                  }`}
                >
                  {selectedTicket.status === 'open' ? (
                    <><CheckCircle className="mr-2 h-4 w-4" /> Mark as Resolved </>
                  ) : (
                    <><Clock className="mr-2 h-4 w-4" /> Reopen Ticket</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 className="text-xl font-bold text-zinc-900">Create New Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-1">Title</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none" placeholder="E.g., Cannot access billing page" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-1">Description</label>
                <textarea required rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none resize-none" placeholder="Provide detailed information about the issue..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-1">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}