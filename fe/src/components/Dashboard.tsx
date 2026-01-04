import { Ticket, TicketStatus, Department } from '../types/ticket';

interface DashboardProps {
  tickets: Ticket[];
  onViewTickets: () => void;
}

export function Dashboard({ tickets, onViewTickets }: DashboardProps) {
  const getTicketsByStatus = (status: TicketStatus) => 
    tickets.filter(t => t.status === status);
  
  const getTicketsByStatusAndDepartment = (status: TicketStatus, department: Department) =>
    tickets.filter(t => t.status === status && t.department === department);

  const getTicketsToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tickets.filter(t => t.createdOn >= today);
  };

  const getTicketsThisWeek = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return tickets.filter(t => t.createdOn >= weekAgo);
  };

  const openCalls = getTicketsByStatus('Open Call');
  const inProgress = getTicketsByStatus('In Progress');
  const closedCalls = getTicketsByStatus('Closed');
  const todayTickets = getTicketsToday();
  const weekTickets = getTicketsThisWeek();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500">A quick snapshot of open callbacks and team workload.</p>
        </div>
        <button
          onClick={onViewTickets}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
        >
          View all tickets
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Open Calls */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2>Open Call: {openCalls.length}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>CRP:</span>
              <span>{getTicketsByStatusAndDepartment('Open Call', 'CRP').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Education/Migration:</span>
              <span>{getTicketsByStatusAndDepartment('Open Call', 'Education/Migration').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Skill Assessment:</span>
              <span>{getTicketsByStatusAndDepartment('Open Call', 'Skill Assessment').length}</span>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2>In Progress: {inProgress.length}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>CRP:</span>
              <span>{getTicketsByStatusAndDepartment('In Progress', 'CRP').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Education/Migration:</span>
              <span>{getTicketsByStatusAndDepartment('In Progress', 'Education/Migration').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Skill Assessment:</span>
              <span>{getTicketsByStatusAndDepartment('In Progress', 'Skill Assessment').length}</span>
            </div>
          </div>
        </div>

        {/* Closed Calls */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2>Closed Call: {closedCalls.length}</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>CRP:</span>
              <span>{getTicketsByStatusAndDepartment('Closed', 'CRP').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Education/Migration:</span>
              <span>{getTicketsByStatusAndDepartment('Closed', 'Education/Migration').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Skill Assessment:</span>
              <span>{getTicketsByStatusAndDepartment('Closed', 'Skill Assessment').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        {/* Today */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{todayTickets.length}</div>
            <div className="text-gray-600">Total Today</div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Open Call: {todayTickets.filter(t => t.status === 'Open Call').length}</div>
            <div>In Progress Call: {todayTickets.filter(t => t.status === 'In Progress').length}</div>
            <div>Closed Call: {todayTickets.filter(t => t.status === 'Closed').length}</div>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{weekTickets.length}</div>
            <div className="text-gray-600">Total This Week</div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Open Call: {weekTickets.filter(t => t.status === 'Open Call').length}</div>
            <div>In Progress Call: {weekTickets.filter(t => t.status === 'In Progress').length}</div>
            <div>Closed Call: {weekTickets.filter(t => t.status === 'Closed').length}</div>
          </div>
        </div>

        {/* Till Date */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{tickets.length}</div>
            <div className="text-gray-600">Total Till Date</div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Open Call: {openCalls.length}</div>
            <div>In Progress Call: {inProgress.length}</div>
            <div>Closed Call: {closedCalls.length}</div>
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <h3 className="mb-4">Department Overview</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="text-2xl mb-1">
              {tickets.filter(t => t.department === 'CRP').length}
            </div>
            <div className="text-gray-600">CRP</div>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="text-2xl mb-1">
              {tickets.filter(t => t.department === 'Education/Migration').length}
            </div>
            <div className="text-gray-600">Education/Migration</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="text-2xl mb-1">
              {tickets.filter(t => t.department === 'Skill Assessment').length}
            </div>
            <div className="text-gray-600">Skill Assessment</div>
          </div>
        </div>
      </div>

      {/* Priority Overview */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <h3 className="mb-4">Priority Overview</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="border-l-4 border-red-500 pl-4">
            <div className="text-2xl mb-1">
              {tickets.filter(t => t.priority === 'High').length}
            </div>
            <div className="text-gray-600">High Priority</div>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="text-2xl mb-1">
              {tickets.filter(t => t.priority === 'Normal').length}
            </div>
            <div className="text-gray-600">Normal Priority</div>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <div className="text-2xl mb-1">
              {tickets.filter(t => t.priority === 'Low').length}
            </div>
            <div className="text-gray-600">Low Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
}
