import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client' | 'developer';
  phone?: string;
  username?: string;
  status: 'online' | 'offline' | 'away' | 'active' | 'inactive' | RequestStatus;
  lastSeen?: string | Timestamp;
  createdAt: string | Timestamp;
  updatedAt?: string | Timestamp;
  isApproved?: boolean; // For manual approval
  // Business details for clients
  businessName?: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessLocation?: string;
  googleMapsLink?: string;
  // Developer specific fields
  experience?: number;
  devRole?: string;
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
  businessEmail: string;
  businessPhone: string;
  gstNumber?: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  description: string;
  websiteName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  documentsUrl?: string;
  referenceWebsite?: string;
  templateId: string;
  domain?: string;
  domainPreferences?: string[];
  paymentOption?: 'full' | 'advance' | 'understanding';
  plan?: 'basic' | 'standard' | 'premium' | 'starter' | 'business' | 'Basic' | 'Pro';
  paymentStatus?: 'pending' | 'paid';
  status: ProjectStatus;
  progress: number;
  startDate?: string | Timestamp;
  deadline?: string | Timestamp;
  internalNotes?: string;
  estimatedCompletion: string | Timestamp | null;
  createdAt: string | Timestamp;
  rejectionReason?: string;
  isDeleted?: boolean;
  isLocked: boolean; // For the lock system
  previewUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string | Timestamp;
  lastSenderId?: string;
  developerId?: string;
  unreadCount?: Record<string, number>;
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Message {
  id: string;
  projectId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  text: string;
  attachments?: Attachment[];
  imageUrl?: string;
  attachmentUrl?: string;
  fileData?: string; // Base64 string
  createdAt: string | Timestamp;
  status: 'sent' | 'delivered' | 'seen';
  seen: boolean;
  seenTime?: string | Timestamp;
  isDeleted?: boolean;
  hiddenFor?: string[];
  deletedForEveryone?: boolean;
}

export interface SystemSettings {
  id: string;
  requiredFields: {
    phone: boolean;
    businessName: boolean;
    businessType: boolean;
    businessNumber: boolean;
    businessLocation: boolean;
    description: boolean;
    websiteName: boolean;
    primaryColor: boolean;
    secondaryColor: boolean;
    logo: boolean;
    documents: boolean;
    referenceWebsite: boolean;
  };
  notifications: {
    newMessages: boolean;
    newProjects: boolean;
  };
  maintenanceMode?: boolean;
  allowNewRegistrations?: boolean;
  baseWebsiteCost?: number;
  pricing?: {
    starter: number;
    pro: number;
    enterprise: number;
  };
  contactEmail?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  portfolioCategories?: string[];
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

export type MeetingStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Reschedule Requested' | 'Completed' | 'Missed';

export interface Meeting {
  id: string;
  title: string;
  clientId: string;
  adminId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  meetingLink: string;
  platform: 'Google Meet' | 'Zoom';
  notes?: string;
  status: MeetingStatus;
  rescheduleMessage?: string;
  preferredDate?: string;
  preferredTime?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface MeetingRequest {
  id: string;
  clientId: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'suggested';
  adminResponse?: string;
  suggestedDate?: string;
  suggestedTime?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'progress' | 'welcome' | 'system' | 'admin';
  createdAt: string | Timestamp;
  read: boolean;
}
