import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client' | 'developer';
  phone?: string;
  createdAt: string | Timestamp;
  isApproved?: boolean; // For manual approval
  // Developer specific fields
  experience?: number;
  devRole?: string;
  status?: RequestStatus;
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
  status: RequestStatus;
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
  | "Completed"
  | "completed"
  | "active"
  | "in-progress"
  | "pending"
  | "rejected";

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'approved';

export interface Project {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  businessName: string;
  businessType: string;
  businessNumber: string;
  businessLocation: string;
  description: string;
  websiteName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  documentsUrl?: string;
  referenceWebsite?: string;
  templateId: string;
  plan?: 'Basic' | 'Pro';
  paymentStatus?: 'pending' | 'paid';
  status: ProjectStatus;
  progress: number;
  estimatedCompletion: string | Timestamp | null;
  createdAt: string | Timestamp;
  rejectionReason?: string;
  isDeleted?: boolean;
  isLocked: boolean; // For the lock system
  previewUrl?: string;
}

export interface Message {
  id: string;
  projectId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  text: string;
  attachmentUrl?: string;
  imageUrl?: string;
  createdAt: string | Timestamp;
  seen: boolean;
  isDeleted?: boolean;
  hiddenFor?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  date: string | Timestamp;
  image: string;
  tags: string[];
  category: string;
}
