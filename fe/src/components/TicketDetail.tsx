import { useEffect, useState } from 'react';
import {
  Activity,
  Calendar,
  Check,
  Copy,
  Edit2,
  FileText,
  Flag,
  Folder,
  Mail,
  Phone,
  Save,
  Trash2,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority, Department } from '../types/ticket';

interface TicketDetailProps {
  ticket: Ticket;
  assigneeOptions: string[];
  onUpdate: (id: string, changes: Partial<Ticket>) => Promise<void> | void;
  onDelete: (ticketId: string) => Promise<void> | void;
  onAddNote: (content: string) => Promise<void> | void;
  onDeleteNote: (noteId: string) => Promise<void> | void;
  onClose: () => void;
}

export function TicketDetail({
  ticket,
  assigneeOptions,
  onUpdate,
  onDelete,
  onClose,
  onAddNote,
  onDeleteNote,
}: TicketDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState(ticket);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    setEditedTicket(ticket);
    setIsEditing(false);
    setCopyStatus('idle');
  }, [ticket]);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(ticket.id, {
      fullName: editedTicket.fullName,
      phoneNumber: editedTicket.phoneNumber,
      email: editedTicket.email,
      reason: editedTicket.reason,
      priority: editedTicket.priority,
      status: editedTicket.status,
      assignedTo: editedTicket.assignedTo,
      reportedBy: editedTicket.reportedBy,
      department: editedTicket.department,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleAddNote = async () => {
    if (newNote.trim()) {
      setIsWorking(true);
      await onAddNote(newNote);
      setIsWorking(false);
      setNewNote('');
    }
  };

  const handleDeleteNoteInternal = async (noteId: string) => {
    setIsWorking(true);
    await onDeleteNote(noteId);
    setIsWorking(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      await onDelete(ticket.id);
    }
  };

  const handleCopyContact = async () => {
    const contactText = `Name: ${editedTicket.fullName}\nEmail: ${editedTicket.email}\nPhone: ${editedTicket.phoneNumber}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contactText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = contactText;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyStatus('copied');
    } catch (error) {
      setCopyStatus('error');
    }

    window.setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyLabel = copyStatus === 'copied'
    ? 'Copied'
    : copyStatus === 'error'
      ? 'Copy failed'
      : 'Copy contact info';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3>Ticket Details</h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                title="Save"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedTicket(ticket);
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleCopyContact}
            className={`p-2 rounded-lg transition-colors ${
              copyStatus === 'copied'
                ? 'text-green-600 hover:bg-green-50'
                : copyStatus === 'error'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={copyLabel}
            aria-label={copyLabel}
          >
            {copyStatus === 'copied' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>Full Name</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedTicket.fullName}
                onChange={(e) => setEditedTicket({...editedTicket, fullName: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1">{ticket.fullName}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>Phone Number</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedTicket.phoneNumber}
                onChange={(e) => setEditedTicket({...editedTicket, phoneNumber: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1">{ticket.phoneNumber}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>Email</span>
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedTicket.email}
                onChange={(e) => setEditedTicket({...editedTicket, email: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1">{ticket.email}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Reason</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedTicket.reason}
                onChange={(e) => setEditedTicket({...editedTicket, reason: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1">{ticket.reason}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <Flag className="w-4 h-4 text-gray-400" />
              <span>Priority</span>
            </label>
            {isEditing ? (
              <select
                value={editedTicket.priority}
                onChange={(e) => setEditedTicket({...editedTicket, priority: e.target.value as TicketPriority})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            ) : (
              <div className="mt-1">{ticket.priority}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span>Status</span>
            </label>
            {isEditing ? (
              <select
                value={editedTicket.status}
                onChange={(e) => setEditedTicket({...editedTicket, status: e.target.value as TicketStatus})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Open Call">Open Call</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            ) : (
              <div className="mt-1">{ticket.status}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <Folder className="w-4 h-4 text-gray-400" />
              <span>Department</span>
            </label>
            {isEditing ? (
              <select
                value={editedTicket.department}
                onChange={(e) => setEditedTicket({...editedTicket, department: e.target.value as Department})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CRP">CRP</option>
                <option value="Education/Migration">Education/Migration</option>
                <option value="Skill Assessment">Skill Assessment</option>
              </select>
            ) : (
              <div className="mt-1">{ticket.department}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gray-400" />
              <span>Assigned To</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                list="assignee-options-edit"
                placeholder="Search and select a user"
                value={editedTicket.assignedTo}
                onChange={(e) => setEditedTicket({...editedTicket, assignedTo: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1">{ticket.assignedTo}</div>
            )}
            {isEditing && (
              <datalist id="assignee-options-edit">
                {assigneeOptions.map((assignee) => (
                  <option key={assignee} value={assignee} />
                ))}
              </datalist>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>Reported By</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedTicket.reportedBy}
                onChange={(e) => setEditedTicket({...editedTicket, reportedBy: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="mt-1">{ticket.reportedBy}</div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Created On</span>
            </label>
            <div className="mt-1">{formatDateTime(ticket.createdOn)}</div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="border-t pt-4">
          <h4 className="mb-3">Notes</h4>
          
          {/* Add Note */}
          <div className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add Note
            </button>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {editedTicket.notes.map((note) => (
              <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm">{note.author}</div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(note.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNoteInternal(note.id)}
                    disabled={isWorking}
                    className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
