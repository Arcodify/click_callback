import { useState, useMemo } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority, Department } from '../types/ticket';

interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  onSelectTicket: (ticket: Ticket) => void;
}

export function TicketList({ tickets, selectedTicket, onSelectTicket }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');
  const [assignedToFilter, setAssignedToFilter] = useState('');

  // Get unique assigned to values
  const assignedToOptions = useMemo(() => {
    const unique = new Set(tickets.map(t => t.assignedTo).filter(Boolean));
    return Array.from(unique).filter((assignee) => assignee.trim() !== '');
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = searchTerm === '' || 
        ticket.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.phoneNumber.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesDepartment = departmentFilter === 'all' || ticket.department === departmentFilter;
      const trimmedAssignedTo = assignedToFilter.trim();
      const matchesAssignedTo = trimmedAssignedTo === '' || 
        ticket.assignedTo.toLowerCase().includes(trimmedAssignedTo.toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && matchesDepartment && matchesAssignedTo;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, departmentFilter, assignedToFilter]);

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours} Hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} Days ago`;
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

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'Open Call': return 'bg-orange-100 text-orange-700';
      case 'In Progress': return 'bg-purple-100 text-purple-700';
      case 'Closed': return 'bg-green-100 text-green-700';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Normal': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-4 gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Open Call">Open Call</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as Department | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            <option value="CRP">CRP</option>
            <option value="Education/Migration">Education/Migration</option>
            <option value="Skill Assessment">Skill Assessment</option>
          </select>

          <div>
            <input
              type="text"
              list="assignee-options-filter"
              placeholder="Search assigned user"
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="assignee-options-filter">
              {assignedToOptions.map((assignee) => (
                <option key={assignee} value={assignee} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      </div>

      {/* Ticket List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tickets found matching your filters
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  {/* Name & Contact */}
                  <div>
                    <div className="font-medium text-gray-900">{ticket.fullName}</div>
                    <div className="text-sm text-gray-600">{ticket.phoneNumber}</div>
                    <div className="text-sm text-gray-500">{ticket.email}</div>
                  </div>

                  {/* Status & Priority */}
                  <div>
                    <div className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </div>
                    <div className={`text-sm mt-1 ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </div>
                  </div>

                  {/* Department & Reason */}
                  <div>
                    <div className="text-sm text-gray-900">{ticket.department}</div>
                    <div className="text-sm text-gray-600 mt-1">{ticket.reason}</div>
                  </div>

                  {/* Assigned & Created */}
                  <div>
                    <div className="text-sm text-gray-900">Assigned: {ticket.assignedTo}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatTimeAgo(ticket.createdOn)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(ticket.createdOn)}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
