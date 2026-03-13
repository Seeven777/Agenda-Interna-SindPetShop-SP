export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UnionEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  responsibleUserId: string;
  category: 'Jurídico' | 'Atividades Sindicais' | 'Administrativo' | 'Fiscalização' | 'Eventos';
  status: 'Agendado' | 'Concluído' | 'Cancelado';
  notes?: string;
  attachments?: string[];
  createdAt: string;
  createdBy: string;
}

export interface LegalCase {
  id?: string;
  caseNumber: string;
  companyName: string;
  workerName: string;
  responsibleLawyerId: string;
  hearingDate: string;
  deadline: string;
  status: 'Novo' | 'Em Andamento' | 'Audiência Marcada' | 'Concluído' | 'Arquivado';
  priority: 'Alta' | 'Média' | 'Baixa';
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  responsibleUserId: string;
  deadline: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
  createdAt: string;
  createdBy: string;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  attachments?: string[];
  createdAt: string;
  isUrgent?: boolean;
}

export interface Activity {
  id?: string;
  userId: string;
  userName: string;
  type: 'create' | 'update' | 'delete' | 'login';
  resource: 'case' | 'task' | 'event' | 'announcement' | 'user';
  details: string;
  timestamp: any;
}
