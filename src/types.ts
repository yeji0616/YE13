export type UserRole = 'handover_giver' | 'handover_receiver' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatarBg: string;
}

export type CategoryType = 'routine' | 'projects' | 'documents_accounts' | 'contacts';

export type Priority = 'high' | 'medium' | 'low';

export type ItemStatus = 'pending' | 'in_progress' | 'giver_completed' | 'receiver_confirmed';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface Comment {
  id: string;
  itemId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorPosition: string;
  content: string;
  createdAt: string;
  isResolved?: boolean;
}

export interface SensitiveCredential {
  accountName: string;
  loginId: string;
  passwordMasked: string; // Real password masked by default
  otpOrAccessGuide?: string;
  url?: string;
}

export interface ChecklistItem {
  id: string;
  handoverId: string;
  category: CategoryType;
  title: string;
  description: string;
  priority: Priority;
  status: ItemStatus;
  targetDate: string;
  links: LinkItem[];
  attachments: Attachment[];
  receiverId: string;
  receiverName: string;
  isSensitive: boolean;
  sensitiveCredential?: SensitiveCredential;
  giverNotes?: string;
  receiverFeedback?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  comments: Comment[];
}

export type HandoverStatus = 'draft' | 'reviewing' | 'approval_requested' | 'approved' | 'rejected';

export interface HandoverHistoryLog {
  id: string;
  timestamp: string;
  action: string;
  userName: string;
  userRole: UserRole;
  detail?: string;
}

export interface HandoverDocument {
  id: string;
  title: string;
  department: string;
  jobRole: string;
  giverId: string;
  giverName: string;
  giverPosition: string;
  giverEmail: string;
  receiverId: string;
  receiverName: string;
  receiverPosition: string;
  receiverEmail: string;
  managerId: string;
  managerName: string;
  managerPosition: string;
  managerEmail: string;
  startDate: string;
  dueDate: string;
  status: HandoverStatus;
  approvalNotes?: string;
  approvedAt?: string;
  rejectedNotes?: string;
  items: ChecklistItem[];
  history: HandoverHistoryLog[];
  templateOriginId?: string;
}

export interface JobTemplate {
  id: string;
  jobTitle: string;
  category: string; // '개발' | '마케팅' | '인사/HR' | '재무/회계' | '영업/기획'
  description: string;
  isStandard: boolean;
  itemCount: number;
  items: Array<{
    category: CategoryType;
    title: string;
    description: string;
    priority: Priority;
    isSensitive: boolean;
    sampleSensitiveCredential?: SensitiveCredential;
    suggestedLinks?: Array<{ title: string; url: string }>;
  }>;
}
