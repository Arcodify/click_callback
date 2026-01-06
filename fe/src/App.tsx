import { useEffect, useMemo, useState } from 'react';
import { InteractionRequiredAuthError, type AccountInfo } from '@azure/msal-browser';
import { Dashboard } from './components/Dashboard';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { NewTicketForm } from './components/NewTicketForm';
import { LoginScreen } from './components/LoginScreen';
import { apiTokenRequest, ensureMsalReady, loginRequest, msalInstance } from './auth/msal';
import { Ticket, TicketStatus, TicketPriority, Department } from './types/ticket';

function App() {
  const API_BASE = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }, []);

  const [authReady, setAuthReady] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<DirectoryUser[]>([]);
  const assigneeOptions = useMemo(() => {
    const unique = new Set<string>();
    directoryUsers.forEach((user) => {
      const value = user.displayName?.trim() || user.userPrincipalName?.trim();
      if (value) unique.add(value);
    });
    tickets.forEach((ticket) => {
      const value = ticket.assignedTo?.trim();
      if (value) unique.add(value);
    });
    const currentUser = userName.trim();
    if (currentUser) unique.add(currentUser);
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [directoryUsers, tickets, userName]);

  const isAuthenticated = Boolean(account);

  useEffect(() => {
    let mounted = true;

    ensureMsalReady()
      .then(() => msalInstance.handleRedirectPromise())
      .then((result) => {
        if (!mounted) return;
        const resolvedAccount =
          result?.account ||
          msalInstance.getActiveAccount() ||
          msalInstance.getAllAccounts()[0] ||
          null;

        if (resolvedAccount) {
          msalInstance.setActiveAccount(resolvedAccount);
          setAccount(resolvedAccount);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Microsoft sign-in failed', err);
        setError('Microsoft sign-in failed. Please try again.');
      })
      .finally(() => {
        if (mounted) setAuthReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!account) {
      setUserName('');
      return;
    }

    setUserName(account.name || account.username || 'User');
    void loadTickets();
    void loadDirectoryUsers();
  }, [account]);

  const handleLogin = () => {
    setError(null);
    if (!import.meta.env.VITE_AZURE_AD_CLIENT_ID) {
      setError('Missing VITE_AZURE_AD_CLIENT_ID. Check your .env settings.');
      return;
    }
    void ensureMsalReady()
      .then(() => msalInstance.loginRedirect(loginRequest))
      .catch((err) => {
        console.error('Microsoft sign-in failed', err);
        setError('Microsoft sign-in failed. Please try again.');
      });
  };

  const handleLogout = () => {
    const logoutAccount = msalInstance.getActiveAccount() || account || undefined;
    setSelectedTicket(null);
    setShowNewTicketForm(false);
    setView('dashboard');
    setAccount(null);
    void msalInstance.logoutRedirect({ account: logoutAccount });
  };

  const getAccessToken = async () => {
    if (!account) return null;
    if (!apiTokenRequest.scopes.length) {
      throw new Error('Missing VITE_AZURE_AD_API_SCOPE');
    }

    await ensureMsalReady();
    try {
      const result = await msalInstance.acquireTokenSilent({
        ...apiTokenRequest,
        account,
      });
      return result.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await msalInstance.acquireTokenRedirect({
          ...apiTokenRequest,
          account,
        });
        return null;
      }
      throw error;
    }
  };

  const authFetch = async (url: string, init?: RequestInit) => {
    const token = await getAccessToken();
    if (!token) throw new Error('Missing access token');
    const headers = new Headers(init?.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE}/tickets`);
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

  const loadDirectoryUsers = async () => {
    try {
      const res = await authFetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setDirectoryUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Microsoft users');
    }
  };

  const handleCreateTicket = async (ticket: Omit<Ticket, 'id' | 'createdOn' | 'notes'>) => {
    setError(null);
    try {
      const res = await authFetch(`${API_BASE}/tickets`, {
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
      const res = await authFetch(`${API_BASE}/tickets/${id}`, {
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
      const res = await authFetch(`${API_BASE}/tickets/${ticketId}`, { method: 'DELETE' });
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
      const res = await authFetch(`${API_BASE}/tickets/${ticketId}/notes`, {
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
      const res = await authFetch(`${API_BASE}/tickets/${ticketId}/notes/${noteId}`, {
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

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Checking Microsoft session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="bg-blue-600 text-white rounded-lg shadow-md flex items-center justify-center"
                style={{ width: 44, height: 44 }}
              >
                CC
              </div>
              <div>
                <h1 className="text-gray-900 font-medium">Callback Console</h1>
                <div className="text-xs text-gray-500">Queue tracking and assignment management</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-end">
              {error && (
                <div className="px-3 py-1 text-xs font-medium text-red-600 bg-gray-100 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex items-center rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => { setView('dashboard'); setSelectedTicket(null); }}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    view === 'dashboard' 
                      ? 'bg-white text-gray-900 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setView('list'); setSelectedTicket(null); }}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    view === 'list' 
                      ? 'bg-white text-gray-900 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Tickets
                </button>
              </div>
              <button
                onClick={() => setShowNewTicketForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                + Add Ticket
              </button>
              <div className="bg-gray-200" style={{ width: 1, height: 28 }} />
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  Signed in as <span className="font-medium text-gray-900">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container p-6">
        {loading && (
          <div className="mb-4 text-gray-600">Loading tickets...</div>
        )}
        <div className="flex gap-6">
          {/* Left Panel - Dashboard or List */}
          <div className={selectedTicket ? 'w-2/3' : 'w-full'}>
            {view === 'dashboard' ? (
              <Dashboard tickets={tickets} />
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
                  assigneeOptions={assigneeOptions}
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
              assigneeOptions={assigneeOptions}
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

type DirectoryUser = {
  id: string;
  displayName: string;
  email: string;
  userPrincipalName: string;
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
