import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { NewTicketForm } from './components/NewTicketForm';
import { LoginScreen } from './components/LoginScreen';
import { Ticket, TicketStatus, TicketPriority, Department } from './types/ticket';

function App() {
  const API_BASE = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('test-auth') === 'true';
  });
  const [userName, setUserName] = useState('Test User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadTickets();
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUserName('Test User');
    localStorage.setItem('test-auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('test-auth');
    setSelectedTicket(null);
    setShowNewTicketForm(false);
    setView('dashboard');
  };

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      const parsed: Ticket[] = data.data.map(mapApiTicket);
      setTickets(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (ticket: Omit<Ticket, 'id' | 'createdOn' | 'notes'>) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });
      if (!res.ok) throw new Error('Failed to create ticket');
      const data = await res.json();
      const newTicket = mapApiTicket(data.data);
      setTickets([newTicket, ...tickets]);
      setShowNewTicketForm(false);
      setSelectedTicket(newTicket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    }
  };

  const handleUpdateTicket = async (id: string, changes: Partial<Ticket>) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      const data = await res.json();
      const updated = mapApiTicket(data.data);
      setTickets(tickets.map(t => t.id === id ? updated : t));
      setSelectedTicket(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket');
      setTickets(tickets.filter(t => t.id !== ticketId));
      setSelectedTicket(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
    }
  };

  const handleAddNote = async (ticketId: string, content: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author: userName }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      const data = await res.json();
      const note = {
        id: data.data.id,
        content: data.data.content,
        author: data.data.author,
        timestamp: new Date(data.data.timestamp),
      };
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, notes: [note, ...t.notes] } : t
        )
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => prev ? { ...prev, notes: [note, ...prev.notes] } : prev);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    }
  };

  const handleDeleteNote = async (ticketId: string, noteId: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete note');
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, notes: t.notes.filter((n) => n.id !== noteId) } : t
        )
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, notes: prev.notes.filter((n) => n.id !== noteId) } : prev
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white font-semibold flex items-center justify-center shadow-sm">
              CC
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">Callback Console</div>
              <div className="text-xs text-gray-500">Queue tracking and assignment management</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-end">
            {error && (
              <div className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-full">
                {error}
              </div>
            )}
            <div className="flex items-center rounded-full bg-gray-100 p-1">
              <button
                onClick={() => { setView('dashboard'); setSelectedTicket(null); }}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  view === 'dashboard' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setView('list'); setSelectedTicket(null); }}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  view === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Tickets
              </button>
            </div>
            <button
              onClick={() => setShowNewTicketForm(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm"
            >
              + New Request
            </button>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Signed in as <span className="font-semibold text-gray-900">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {loading && (
          <div className="mb-4 text-gray-600">Loading tickets...</div>
        )}
        <div className="flex gap-6">
          {/* Left Panel - Dashboard or List */}
          <div className={selectedTicket ? 'w-2/3' : 'w-full'}>
            {view === 'dashboard' ? (
              <Dashboard tickets={tickets} onViewTickets={() => setView('list')} />
            ) : (
              <TicketList 
                tickets={tickets} 
                selectedTicket={selectedTicket}
                onSelectTicket={setSelectedTicket}
              />
            )}
          </div>

          {/* Right Panel - Ticket Detail */}
            {selectedTicket && (
              <div className="w-1/3">
                <TicketDetail
                  ticket={selectedTicket}
                  onUpdate={handleUpdateTicket}
                  onDelete={handleDeleteTicket}
                  onAddNote={(content) => handleAddNote(selectedTicket.id, content)}
                  onDeleteNote={(noteId) => handleDeleteNote(selectedTicket.id, noteId)}
                  onClose={() => setSelectedTicket(null)}
                />
              </div>
            )}
          </div>
      </main>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <NewTicketForm
              onSubmit={handleCreateTicket}
              onCancel={() => setShowNewTicketForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

type ApiTicket = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  reason: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  reportedBy: string;
  department: Department;
  createdOn: string;
  notes: { id: string; content: string; author: string; timestamp: string }[];
};

function mapApiTicket(ticket: ApiTicket): Ticket {
  return {
    ...ticket,
    createdOn: new Date(ticket.createdOn),
    notes: ticket.notes
      .map((note) => ({
        ...note,
        timestamp: new Date(note.timestamp),
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  };
}

export default App;
