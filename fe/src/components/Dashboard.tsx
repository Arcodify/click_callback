import { Calendar, CheckCircle, Circle, Clock } from 'lucide-react';
import { Ticket, TicketStatus, Department } from '../types/ticket';

interface DashboardProps {
  tickets: Ticket[];
}

export function Dashboard({ tickets }: DashboardProps) {
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
  const todayOpen = todayTickets.filter(t => t.status === 'Open Call').length;
  const todayInProgress = todayTickets.filter(t => t.status === 'In Progress').length;
  const todayClosed = todayTickets.filter(t => t.status === 'Closed').length;
  const weekOpen = weekTickets.filter(t => t.status === 'Open Call').length;
  const weekInProgressCount = weekTickets.filter(t => t.status === 'In Progress').length;
  const weekClosed = weekTickets.filter(t => t.status === 'Closed').length;

  return (
    <div className="dashboard">
      {/* Status Cards */}
      <div className="dashboard-grid">
        {/* Open Calls */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <span className="dashboard-dot dashboard-dot-orange" />
              <span>Open Call</span>
            </div>
            <div className="dashboard-card-value">{openCalls.length}</div>
          </div>
          <div className="dashboard-metric-list">
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">CRP:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('Open Call', 'CRP').length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">Education/Migration:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('Open Call', 'Education/Migration').length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">Skill Assessment:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('Open Call', 'Skill Assessment').length}</span>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <span className="dashboard-dot dashboard-dot-amber" />
              <span>In Progress</span>
            </div>
            <div className="dashboard-card-value">{inProgress.length}</div>
          </div>
          <div className="dashboard-metric-list">
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">CRP:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('In Progress', 'CRP').length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">Education/Migration:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('In Progress', 'Education/Migration').length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">Skill Assessment:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('In Progress', 'Skill Assessment').length}</span>
            </div>
          </div>
        </div>

        {/* Closed Calls */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <span className="dashboard-dot dashboard-dot-green" />
              <span>Closed Call</span>
            </div>
            <div className="dashboard-card-value">{closedCalls.length}</div>
          </div>
          <div className="dashboard-metric-list">
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">CRP:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('Closed', 'CRP').length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">Education/Migration:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('Closed', 'Education/Migration').length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">Skill Assessment:</span>
              <span className="dashboard-metric-value">{getTicketsByStatusAndDepartment('Closed', 'Skill Assessment').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        {/* Today */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <Calendar className="dashboard-title-icon" />
              <span>Total Today</span>
            </div>
            <div className="dashboard-card-value">{todayTickets.length}</div>
          </div>
          <div className="dashboard-metric-list">
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <Circle className="dashboard-metric-icon dashboard-icon-open" />
                <span>Open Call:</span>
              </span>
              <span className="dashboard-metric-value">{todayOpen}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <Clock className="dashboard-metric-icon dashboard-icon-progress" />
                <span>In Progress Call:</span>
              </span>
              <span className="dashboard-metric-value">{todayInProgress}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <CheckCircle className="dashboard-metric-icon dashboard-icon-closed" />
                <span>Closed Call:</span>
              </span>
              <span className="dashboard-metric-value">{todayClosed}</span>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <Calendar className="dashboard-title-icon" />
              <span>Total This Week</span>
            </div>
            <div className="dashboard-card-value">{weekTickets.length}</div>
          </div>
          <div className="dashboard-metric-list">
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <Circle className="dashboard-metric-icon dashboard-icon-open" />
                <span>Open Call:</span>
              </span>
              <span className="dashboard-metric-value">{weekOpen}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <Clock className="dashboard-metric-icon dashboard-icon-progress" />
                <span>In Progress Call:</span>
              </span>
              <span className="dashboard-metric-value">{weekInProgressCount}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <CheckCircle className="dashboard-metric-icon dashboard-icon-closed" />
                <span>Closed Call:</span>
              </span>
              <span className="dashboard-metric-value">{weekClosed}</span>
            </div>
          </div>
        </div>

        {/* Till Date */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-title">
              <Calendar className="dashboard-title-icon" />
              <span>Total Till Date</span>
            </div>
            <div className="dashboard-card-value">{tickets.length}</div>
          </div>
          <div className="dashboard-metric-list">
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <Circle className="dashboard-metric-icon dashboard-icon-open" />
                <span>Open Call:</span>
              </span>
              <span className="dashboard-metric-value">{openCalls.length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <Clock className="dashboard-metric-icon dashboard-icon-progress" />
                <span>In Progress Call:</span>
              </span>
              <span className="dashboard-metric-value">{inProgress.length}</span>
            </div>
            <div className="dashboard-metric-row">
              <span className="dashboard-metric-label">
                <CheckCircle className="dashboard-metric-icon dashboard-icon-closed" />
                <span>Closed Call:</span>
              </span>
              <span className="dashboard-metric-value">{closedCalls.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">Department Overview</div>
        </div>
        <div className="dashboard-tile-grid">
          <div className="dashboard-tile">
            <span className="dashboard-tile-label">
              <span className="dashboard-dot dashboard-dot-blue" />
              <span>CRP</span>
            </span>
            <span className="dashboard-tile-value">
              {tickets.filter(t => t.department === 'CRP').length}
            </span>
          </div>
          <div className="dashboard-tile">
            <span className="dashboard-tile-label">
              <span className="dashboard-dot dashboard-dot-purple" />
              <span>Education/Migration</span>
            </span>
            <span className="dashboard-tile-value">
              {tickets.filter(t => t.department === 'Education/Migration').length}
            </span>
          </div>
          <div className="dashboard-tile">
            <span className="dashboard-tile-label">
              <span className="dashboard-dot dashboard-dot-green" />
              <span>Skill Assessment</span>
            </span>
            <span className="dashboard-tile-value">
              {tickets.filter(t => t.department === 'Skill Assessment').length}
            </span>
          </div>
        </div>
      </div>

      {/* Priority Overview */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <div className="dashboard-card-title">Priority Overview</div>
        </div>
        <div className="dashboard-tile-grid">
          <div className="dashboard-tile">
            <span className="dashboard-tile-label">
              <span className="dashboard-dot dashboard-dot-red" />
              <span>High Priority</span>
            </span>
            <span className="dashboard-tile-value">
              {tickets.filter(t => t.priority === 'High').length}
            </span>
          </div>
          <div className="dashboard-tile">
            <span className="dashboard-tile-label">
              <span className="dashboard-dot dashboard-dot-amber" />
              <span>Normal Priority</span>
            </span>
            <span className="dashboard-tile-value">
              {tickets.filter(t => t.priority === 'Normal').length}
            </span>
          </div>
          <div className="dashboard-tile">
            <span className="dashboard-tile-label">
              <span className="dashboard-dot dashboard-dot-green" />
              <span>Low Priority</span>
            </span>
            <span className="dashboard-tile-value">
              {tickets.filter(t => t.priority === 'Low').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
