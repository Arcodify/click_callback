export type TicketStatus = 'Open Call' | 'In Progress' | 'Closed';
export type TicketPriority = 'Low' | 'Normal' | 'High';
export type Department = 'CRP' | 'Education/Migration' | 'Skill Assessment';

export interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
}

export interface Ticket {
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
  createdOn: Date;
  notes: Note[];
}
