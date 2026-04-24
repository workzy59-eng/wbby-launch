import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client' | 'developer' | 'sales';
  phone?: string;
  username?: string;
  status: 'online' | 'offline' | 'away' | 'active' | 'inactive' | RequestStatus;
  lastSeen?: string | Timestamp;
  createdAt: string | Timestamp;
  updatedAt?: string | Timestamp;
  isApproved?: boolean;
  commissionEarned?: number;
  salesCode?: string; // For sales users
  referralCode?: string; // For clients who used a sales code
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  // ... rest of the fields
  
  // Settings & Preferences
  notificationPreferences?: {
    email: boolean;
    meetingReminders: boolean;
    paymentAlerts: boolean;
    messages: boolean;
  };
  theme?: 'light' | 'dark';
  
  // Admin specific
  businessInfo?: {
    name: string;
    email: string;
    phone: string;
    website: string;
    logo?: string;
  };
  paymentDetails?: {
    upiId: string;
    bankDetails: {
      accountName: string;
      accountNumber: string;
      ifscCode: string;
    };
  };
  invoiceSettings?: {
    prefix: string;
    taxPercentage?: number;
    currency: string;
  };
  adminMeetingSettings?: {
    defaultDuration: number;
    allowRescheduling: boolean;
    reminders: {
      oneHour: boolean;
      tenMinutes: boolean;
    };
    allowClientRequests: boolean;
    autoApprove: boolean;
  };

  // Client specific
  companyName?: string;
  meetingPreferences?: {
    preferredTimeSlot?: string;
    enableReminders: boolean;
  };
  communicationPreferences?: {
    whatsapp: boolean;
    emailUpdates: boolean;
  };
  plan?: 'Basic' | 'Standard' | 'Premium';
  lastLogin?: string | Timestamp;

  // Business details for clients (Legacy/Duplicate - keeping for compatibility but preferring structured fields above)
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

export interface Lead {
  id: string;
  businessName: string;
  phone: string;
  businessType?: string;
  location?: string;
  status: 'Not Called' | 'Called' | 'Interested' | 'Not Interested' | 'Follow-up' | 'Closed';
  notes?: string;
  followUpDate?: Timestamp;
  assignedSalesId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Commission {
  id: string;
  salesId: string;
  paymentId: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: Timestamp;
}

export interface DeveloperApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string;
  experience: string;
  portfolio: string;
  availability: string;
  maxProjectsPerWeek: number;
  expectedEarnings: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface SalesApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  languages: string;
  availability: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  type: 'one-time' | 'subscription';
  status: 'pending' | 'completed';
  stripeSessionId?: string;
  createdAt: Timestamp;
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
  userName?: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'leave';
  inTime?: string;
  outTime?: string;
  checkInTime?: string;
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
  tertiaryColor?: string;
  secondaryColor: string;
  logoUrl?: string;
  documentsUrl?: string;
  referenceWebsite?: string;
  selectedFeatures?: string[];
  templateId: string;
  domain?: string;
  domainPreferences?: string[];
  paymentOption?: 'full' | 'advance' | 'understanding';
  plan?: 'basic' | 'standard' | 'premium' | 'starter' | 'business' | 'Basic' | 'Standard' | 'Premium' | 'Pro';
  paymentStatus?: 'pending' | 'paid';
  subscriptionStatus?: 'active' | 'past_due' | 'suspended' | 'canceled';
  nextBillingDate?: string | Timestamp;
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
  websiteUrl?: string;
  acceptedAt?: string | Timestamp;
  urlSubmittedAt?: string | Timestamp;
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
  receiverId?: string; // Added for direct messages
  senderName: string;
  text: string;
  fileUrl?: string; // Added for Cloudinary
  type: 'text' | 'image' | 'audio'; // Added
  attachments?: Attachment[];
  imageUrl?: string;
  attachmentUrl?: string;
  fileData?: string; // Base64 string
  fileName?: string;
  createdAt: string | Timestamp;
  status: 'sent' | 'delivered' | 'seen';
  seen: boolean;
  seenTime?: string | Timestamp;
  isDeleted?: boolean;
  hiddenFor?: string[];
  deletedForEveryone?: boolean;
  edited?: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
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
  developerId?: string; // Assigned developer
  projectId?: string; // Linked project
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
