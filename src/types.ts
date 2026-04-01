import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client' | 'developer';
  phone?: string;
  createdAt: string | Timestamp;
  // Developer specific fields
  experience?: number;
  devRole?: string;
  status?: 'pending' | 'accepted' | 'declined';
  joiningDate?: string | Timestamp;
  absences?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  startDate: string | Timestamp;
  endDate: string | Timestamp;
  reason: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string | Timestamp;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'leave';
  inTime?: string;
  outTime?: string;
}

export type ProjectStatus = 
  | "Waiting for Review" 
  | "Under Review" 
  | "Accepted" 
  | "Rejected" 
  | "Development Started" 
  | "Completed";

export interface Project {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  businessName: string;
  businessType: string;
  description: string;
  templateId: string;
  status: ProjectStatus;
  progress: number;
  estimatedCompletion: string | Timestamp | null;
  createdAt: string | Timestamp;
  rejectionReason?: string;
  isDeleted?: boolean;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachmentUrl?: string;
  createdAt: string | Timestamp;
  seen: boolean;
}
