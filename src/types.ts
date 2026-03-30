import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client';
  createdAt: string | Timestamp;
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
