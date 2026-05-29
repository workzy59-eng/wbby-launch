import { Timestamp } from 'firebase/firestore';

export interface CloudinaryAsset {
  secure_url: string;
  public_id: string;
  original_filename: string;
  resource_type?: string;
  createdAt?: Timestamp | string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'client' | 'developer' | 'sales';
  phone?: string;
  username?: string;
  status: 'online' | 'offline' | 'away' | 'active' | 'inactive' | 'suspended' | RequestStatus;
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
  notes?: string; 
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
    logoMetadata?: CloudinaryAsset;
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
  favoriteConversations?: string[];
  isPunchedIn?: boolean;
  lastPunchIn?: string | Timestamp;
  lastPunchOut?: string | Timestamp;

  // Business details for clients (Legacy/Duplicate - keeping for compatibility but preferring structured fields above)
  businessName?: string;
  businessType?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessLocation?: string;
  googleMapsLink?: string;
  // Developer specific fields
  experience?: number | string;
  devRole?: string;
  joiningDate?: string | Timestamp;
  absences?: number;
  activeProjects?: number;
  paymentLinks?: {
    oneTime: {
      basic: string;
      standard: string;
      premium: string;
    };
  };
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
  type: 'one-time';
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
  checkIn?: string;
  checkOut?: string;
  totalHours?: number;
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
  | "assigned"
  | "delayed"
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
  storeType: 'online_store' | 'local_store';
  locationState?: string;
  preferredColors?: string[];
  requestedDomain?: string;
  domainStatus?: 'owned' | 'buy';
  domainPreferences?: string;
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
  paymentOption?: 'full' | 'advance' | 'understanding';
  plan?: 'basic' | 'standard' | 'premium' | 'starter' | 'business' | 'Basic' | 'Standard' | 'Premium' | 'Pro';
  paymentStatus?: 'pending' | 'paid' | 'verifying' | 'unpaid' | 'pending_verification';
  utr?: string;
  paymentLink?: string;
  nextBillingDate?: string | Timestamp;
  status: ProjectStatus;
  progress: number;
  startDate?: string | Timestamp;
  deadline?: string | Timestamp;
  internalNotes?: string;
  estimatedCompletion: string | Timestamp | null;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
  rejectionReason?: string;
  isDeleted?: boolean;
  isLocked: boolean; // For the lock system
  previewUrl?: string;
  paymentLinkBasic?: string;
  paymentLinkPremium?: string;
  aiDeveloperBrief?: string;
  promptEngineeringInstruction?: string;
  developerNote?: string;
  lastMessage?: string;
  lastMessageAt?: string | Timestamp;
  lastSenderId?: string;
  developerId?: string;
  assignedTo?: string; // New field for assigned developer UID
  unreadCount?: Record<string, number>;
  websiteUrl?: string;
  acceptedAt?: string | Timestamp;
  urlSubmittedAt?: string | Timestamp;
  aiPrompt?: string;
  startedAt?: string | Timestamp;
  payout?: number;
  domainPrice?: number;
  ownsDomain?: boolean;
  domainRegistrar?: string;
  domainTransferAuth?: string;
  domainChoices?: string[];
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
  fileType?: string; // Added for Cloudinary metadata
  type: 'text' | 'image' | 'video' | 'file' | 'audio' | 'voice'; 
  duration?: number;
  temp?: boolean;
  mediaUrl?: string;
  mentions?: string[];
  attachments?: Attachment[];
  imageUrl?: string;
  attachmentUrl?: string;
  fileData?: string; // Base64 string
  fileName?: string;
  fileSize?: number;
  createdAt: string | Timestamp | Date;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
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
  reactions?: Record<string, string[]>; // emoji -> [uids]
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
  paymentLinks?: {
    basic: string;
    standard: string;
    premium: string;
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

export type MeetingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'missed';

export interface Meeting {
  id: string;
  title: string;
  clientId: string;
  clientEmail?: string;
  adminId: string;
  developerId?: string; // Assigned developer
  developerEmail?: string;
  projectId?: string; // Linked project
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration?: number; // In minutes
  meetingLink: string;
  platform: 'Google Meet' | 'Zoom';
  notes?: string;
  status: MeetingStatus;
  requestedBy: string; // UID of requester
  acceptedBy?: string; // UID of accepter
  rescheduleMessage?: string;
  preferredDate?: string;
  preferredTime?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

export interface MeetingRequest {
  id: string;
  clientId: string;
  developerId?: string;
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

export interface BioLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood?: string;
  notes?: string;
  data?: any;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}
