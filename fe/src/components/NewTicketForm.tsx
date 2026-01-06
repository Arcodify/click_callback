import { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, Department } from '../types/ticket';

interface NewTicketFormProps {
  onSubmit: (ticket: Omit<Ticket, 'id' | 'createdOn' | 'notes'>) => void;
  onCancel: () => void;
  assigneeOptions: string[];
}

export function NewTicketForm({ onSubmit, onCancel, assigneeOptions }: NewTicketFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    reason: '',
    priority: 'Normal' as TicketPriority,
    status: 'Open Call' as TicketStatus,
    assignedTo: '',
    reportedBy: '',
    department: 'Education/Migration' as Department
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="mb-4">New Callback Request</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CRP">CRP</option>
            <option value="Education/Migration">Education/Migration</option>
            <option value="Skill Assessment">Skill Assessment</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.reason}
            onChange={(e) => handleChange('reason', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Open Call">Open Call</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Assigned To <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.assignedTo}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={assigneeOptions.length === 0}
          >
            <option value="" disabled>
              {assigneeOptions.length ? 'Select a user' : 'No users available'}
            </option>
            {assigneeOptions.map((assignee) => (
              <option key={assignee} value={assignee}>
                {assignee}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Reported By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.reportedBy}
            onChange={(e) => handleChange('reportedBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Ticket
        </button>
      </div>
    </form>
  );
}
