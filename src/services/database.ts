import { 
  db, auth, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, Timestamp, limit,
  ref, uploadBytes, getDownloadURL, storage, getDocFromServer, arrayUnion, arrayRemove, runTransaction, onAuthStateChanged, getCountFromServer
} from '../firebase';
import { FirebaseUser } from '../firebase';
import { UserProfile, Project, Message, LeaveRequest, Attendance, BlogPost, SystemSettings, Meeting, BioLog } from '../types';
import { ADMIN_EMAIL, DEVELOPER_EMAIL } from '../constants';
import { toast } from 'react-hot-toast';

export { db };

// Bio Log Operations
export const saveBioLog = async (logData: Partial<BioLog>) => {
  const dateStr = logData.date;
  const uid = currentUser?.uid;
  if (!uid || !dateStr) throw new Error("Missing requirements");
  
  const logId = `${uid}_${dateStr}`;
  const path = `bio_logs/${logId}`;
  
  try {
    await setDoc(doc(db, 'bio_logs', logId), {
      ...logData,
      userId: uid,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp() 
    }, { merge: true });
    toast.success("Log saved successfully");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getBioLogs = async (userId: string, year: number) => {
  const path = 'bio_logs';
  try {
    const q = query(
      collection(db, 'bio_logs'),
      where('userId', '==', userId),
      where('date', '>=', `${year}-01-01`),
      where('date', '<=', `${year}-12-31`)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BioLog));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const createNotification = async (data: any) => {
  try {
    const notificationData = {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    };
    
    // Ensure userId or role is present
    if (!notificationData.userId && !notificationData.role) {
      console.warn('Notification missing recipient (userId or role):', notificationData);
    }
    
    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Notification failed:', error);
  }
};

export let currentUser: FirebaseUser | null = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    currentUser = null;
    return;
  }
  currentUser = user;
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (errorMessage.includes('resource-exhausted') || errorMessage.includes('Quota limit exceeded')) {
    toast.error("System Overload: Daily free tier quota exceeded. Service will resume tomorrow.", { id: 'quota-error' });
  } else if (errorMessage.includes('permission-denied') || errorMessage.includes('insufficient permissions')) {
    if (operationType !== OperationType.LIST) {
      toast.error("Permission denied for this operation.");
    }
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
        displayName: provider.displayName,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error Details:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

import axios from 'axios';

export interface CloudinaryResponse {
  url: string;
  secure_url: string;
  public_id: string;
  original_filename: string;
  resource_type: string;
}

// Enhanced upload helper using direct Cloudinary upload (client-side)
export const uploadFile = async (
  file: File, 
  folder: string = 'webbylaunch', 
  onProgress?: (percent: number) => void
): Promise<CloudinaryResponse> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvrxv19t0';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'iahbvbad';

  // Validation
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Max size is 10MB.');
  }

  const allowedTypes = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp',
    'application/pdf', 'application/zip', 'application/x-zip-compressed',
    'video/mp4', 'video/mpeg', 'video/quicktime',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/octet-stream'
  ];
  const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|svg|webp)$/i.test(file.name);
  
  if (!allowedTypes.includes(file.type) && !isImage) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const moreAllowed = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'mp4', 'mov'];
    if (!ext || !moreAllowed.includes(ext)) {
      // We'll allow it anyway but log it, or we could just remove the check if we trust the user.
      // For now, let's just make the list more comprehensive.
    }
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    // Use XHR for progress tracking as fetch doesn't support it natively for uploads
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            secure_url: response.secure_url,
            public_id: response.public_id,
            original_filename: file.name,
            resource_type: response.resource_type
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });

  } catch (error) {
    console.error('File upload failed:', error);
    throw new Error('File upload failed. Please check your cloud configuration.');
  }
};




// User Profile Operations
export const isUserAdmin = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return false;
  const data = userDoc.data();
  const adminEmails = [ADMIN_EMAIL.toLowerCase()];
  const userEmail = data.email?.toLowerCase() || '';
  return data.role === 'admin' || adminEmails.includes(userEmail);
};

export const createUserProfile = async (user: FirebaseUser, additionalData: any = {}) => {
  if (!user?.uid) {
    console.error("CREATE USER PROFILE ERROR: No UID provided");
    return;
  }
  
  console.log("AUTH UID:", user.uid);
  const path = `users/${user.uid}`;
  
  try {
    let role = 'client';
    const adminEmails = [ADMIN_EMAIL.toLowerCase()];
    const devEmails = [DEVELOPER_EMAIL.toLowerCase(), 'sain17296174@gmail.com', 'singhhritik560@gmail.com', 'shivamt2023@gmail.com'];
    
    if (adminEmails.includes(user.email?.toLowerCase() || '')) {
      role = 'admin';
    } else if (devEmails.includes(user.email?.toLowerCase() || '')) {
      role = 'developer';
    }

    const defaultName = (user.displayName || "");

    // PART 2 — FIX USER WRITE METHOD: setDoc with user.uid and merge: true
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: defaultName,
      name: defaultName,
      photoURL: user.photoURL || "",
      role: role,
      status: 'online',
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData
    }, { merge: true });
    
    console.log("User profile synced successfully for:", user.uid);
  } catch (error) {
    console.error("Permission error or write failed for users/" + user.uid, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// Implement Swiggy Style project acceptance
export const acceptProject = async (projectId: string) => {
  if (!currentUser) throw new Error("Auth required");
  
  try {
    await runTransaction(db, async (tx) => {
      const ref = doc(db, "projects", projectId);
      const snap = await tx.get(ref);

      if (!snap.exists()) throw "Not found";
      
      const projectData = snap.data();
      
      if (snap.data().developerId) throw "Already taken";
      const plan = projectData.plan?.toLowerCase() || 'basic';
      const payout = plan === 'premium' ? 4500 : plan === 'standard' ? 2250 : 1125;

      tx.update(ref, {
        developerId: currentUser!.uid,
        status: "Accepted",
        payout: payout,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Add notification for developer
      const notificationRef = doc(collection(db, 'notifications'));
      tx.set(notificationRef, {
        userId: currentUser!.uid,
        type: 'project_assigned',
        title: 'New Project Claimed',
        message: `You have successfully claimed the project: ${snap.data().businessName}`,
        projectId: projectId,
        read: false,
        createdAt: serverTimestamp()
      });

      // Add notification for admin
      const adminNotificationRef = doc(collection(db, 'notifications'));
      tx.set(adminNotificationRef, {
        role: 'admin',
        type: 'project_accepted',
        title: 'Project Claimed',
        message: `Developer ${currentUser!.displayName || 'User'} has claimed project: ${snap.data().businessName}`,
        projectId: projectId,
        read: false,
        createdAt: serverTimestamp()
      });

      // PART 5: Auto Chat Creation
      const clientUid = projectData.userId;
      const developerUid = currentUser!.uid;
      const conversationId = getConversationId(clientUid, developerUid);
      const conversationRef = doc(db, 'conversations', conversationId);
      
      tx.set(conversationRef, {
        participants: [clientUid, developerUid],
        updatedAt: serverTimestamp(),
        lastMessage: "Hi, I’m your developer. I’ll take care of your project.",
        lastMessageAt: serverTimestamp(),
        projectId: projectId,
        unreadCount: {
          [clientUid]: 1,
          [developerUid]: 0
        }
      }, { merge: true });

      const messagesRef = doc(collection(db, 'conversations', conversationId, 'messages'));
      tx.set(messagesRef, {
        text: "Hi, I’m your developer. I’ll take care of your project.",
        senderId: developerUid,
        createdAt: serverTimestamp(),
        status: 'sent',
        seen: false
      });
    });

    toast.success("Project accepted! Chat initiated with client.");
  } catch (error: any) {
    console.error("Acceptance failed:", error);
    toast.error(typeof error === 'string' ? error : (error.message || "Failed to accept project."));
    throw error;
  }
};

export const updateUserStatus = async (uid: string, status: 'online' | 'offline' | 'away') => {
  const path = `users/${uid}`;
  try {
    // Use setDoc with merge to ensure document exists
    await setDoc(doc(db, 'users', uid), {
      status,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    // Silently fail for status updates to avoid UI noise
    console.warn('Status update failed:', error);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const setUserTyping = async (conversationId: string, userId: string, isTyping: boolean) => {
  const path = `conversations/${conversationId}/typing/${userId}`;
  try {
    await setDoc(doc(db, 'conversations', conversationId, 'typing', userId), {
      isTyping,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Typing status update failed:', error);
  }
};

export const getTypingStatus = (conversationId: string, callback: (typingUsers: string[]) => void) => {
  const path = `conversations/${conversationId}/typing`;
  const q = query(collection(db, 'conversations', conversationId, 'typing'), where('isTyping', '==', true));
  
  return onSnapshot(q, (snapshot) => {
    const typingUsers = snapshot.docs.map(doc => doc.id);
    callback(typingUsers);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const searchUsers = async (queryStr: string) => {
  const path = 'users';
  try {
    const qWithUsername = query(
      collection(db, 'users'),
      where('username', '>=', queryStr),
      where('username', '<=', queryStr + '\uf8ff'),
      limit(5)
    );
    const qWithDisplayName = query(
      collection(db, 'users'),
      where('displayName', '>=', queryStr),
      where('displayName', '<=', queryStr + '\uf8ff'),
      limit(5)
    );
    
    const [snap1, snap2] = await Promise.all([getDocs(qWithUsername), getDocs(qWithDisplayName)]);
    const users = new Map();
    snap1.docs.forEach(doc => users.set(doc.id, { uid: doc.id, ...doc.data() }));
    snap2.docs.forEach(doc => users.set(doc.id, { uid: doc.id, ...doc.data() }));
    
    return Array.from(users.values());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const checkUsernameUnique = async (username: string) => {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return false;
  }
};

// Domain availability check
export const checkDomainInUse = async (domain: string) => {
  try {
    const dLower = domain.toLowerCase();
    const q1 = query(collection(db, 'projects'), where('domain', '==', dLower), limit(1));
    const q2 = query(collection(db, 'projects'), where('requestedDomain', '==', dLower), limit(1));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    return !snap1.empty || !snap2.empty;
  } catch (error) {
    console.error('Error checking domain:', error);
    return false;
  }
};

export const getUserProfile = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { uid: userDoc.id, ...userDoc.data() } as UserProfile : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateProfile = async (uid: string, data: any) => {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// User Management Queries (Admin Only)
export const getUserCount = async () => {
  if (!currentUser) return 0;
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error: any) {
    if (error.message?.includes('Quota')) return 0;
    console.error("Error getting user count:", error);
    return 0;
  }
};

export const getProfiles = async () => {
  const path = 'users';
  if (!currentUser) return [];
  
  try {
    // Basic check for admin or developer before query to avoid console noise
    const isAdmin = currentUser.email === ADMIN_EMAIL || (await isUserAdmin(currentUser.uid));
    const isDeveloper = currentUser.email === ADMIN_EMAIL || (await getUserProfile(currentUser.uid))?.role === 'developer';
    
    if (!isAdmin && !isDeveloper) {
      console.warn("Non-authorized user attempted to getProfiles");
      return [];
    }

    // Limit large fetches
    const snapshot = await getDocs(query(collection(db, 'users'), limit(200)));
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error: any) {
    if (error.message?.includes('Quota')) return [];
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// Cache for admin profiles to avoid repeated reads
let cachedAdmins: UserProfile[] | null = null;
let lastAdminFetch = 0;
const CACHE_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export const getAdmins = async () => {
  const path = 'users';
  if (!currentUser) return [];

  // Return cached version if still fresh
  if (cachedAdmins && (Date.now() - lastAdminFetch < CACHE_STALE_TIME)) {
    return cachedAdmins;
  }

  try {
    // We filter by role=admin and limit to avoid massive reads
    const q = query(collection(db, 'users'), where('role', '==', 'admin'), limit(5));
    const snapshot = await getDocs(q);
    const admins = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    
    cachedAdmins = admins;
    lastAdminFetch = Date.now();
    return admins;
  } catch (error: any) {
    // If it's a permission error or quota error, return empty silenty to prevent app crash
    if (error.message?.includes('permission-denied') || error.code === 'permission-denied' || error.message?.includes('Quota')) {
      if (cachedAdmins) return cachedAdmins; // Use stale cache if quota hit
      return [];
    }
    return [];
  }
};

export const getClients = async () => {
  const path = 'users';
  if (!currentUser) return [];

  try {
    const isAdmin = currentUser.email === ADMIN_EMAIL || (await isUserAdmin(currentUser.uid));
    const isDeveloper = currentUser.email === ADMIN_EMAIL || (await getUserProfile(currentUser.uid))?.role === 'developer';
    
    if (!isAdmin && !isDeveloper) return [];

    const q = query(collection(db, 'users'), where('role', '==', 'client'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    return [];
  }
};

// Leave Operations
export const requestLeave = async (leaveData: any) => {
  const path = 'leave_requests';
  try {
    const docRef = await addDoc(collection(db, 'leave_requests'), {
      ...leaveData,
      createdAt: serverTimestamp(),
    });

    // Notify admins about the new leave request
    await createNotification({
      role: 'admin',
      type: 'leave_requested',
      title: 'New Leave Request',
      message: `${leaveData.userName} has requested leave for ${leaveData.startDate} to ${leaveData.endDate}.`,
      leaveRequestId: docRef.id,
      userId: leaveData.userId // Keep requester ID for context
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getLeaveRequests = async (userId: string) => {
  const path = 'leave_requests';
  try {
    const q = query(collection(db, 'leave_requests'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAllLeaveRequests = async () => {
  const path = 'leave_requests';
  try {
    const q = query(collection(db, 'leave_requests'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAllLeaveRequestsSnap = (callback: (leaves: LeaveRequest[]) => void) => {
  const q = query(collection(db, 'leave_requests'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest)));
  }, (error) => {
    console.error("Leave requests snapshot error:", error);
  });
};

export const updateLeaveStatus = async (requestId: string, status: string) => {
  const path = `leave_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'leave_requests', requestId), { status, updatedAt: serverTimestamp() });
    
    // Get the leave request to know who to notify
    const leaveSnap = await getDoc(doc(db, 'leave_requests', requestId));
    if (leaveSnap.exists()) {
      const leaveData = leaveSnap.data();
      
      await createNotification({
        userId: leaveData.userId,
        type: 'leave_status_update',
        title: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your leave request from ${leaveData.startDate} has been ${status}.`,
        leaveRequestId: requestId,
        status: status
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Attendance Operations
// Developer Performance Tracking
export const getDeveloperStats = async (uid: string) => {
  try {
    const projectsRef = collection(db, 'projects');
    const qCompleted = query(projectsRef, where('developerId', '==', uid), where('status', '==', 'Completed'));
    const qActive = query(projectsRef, where('developerId', '==', uid), where('status', 'in', ['Development Started', 'Accepted', 'Under Review']));
    
    const [completedSnap, activeSnap] = await Promise.all([
      getDocs(qCompleted),
      getDocs(qActive)
    ]);

    const completed = completedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    const active = activeSnap.docs.length;
    
    // Calculate total payout
    const totalPayout = completed.reduce((acc, p) => acc + (p.payout || 0), 0);
    
    // Calculate total hours from attendance
    const attendanceRef = collection(db, 'attendance');
    const qAttendance = query(attendanceRef, where('userId', '==', uid));
    const attendanceSnap = await getDocs(qAttendance);
    
    let totalMinutes = 0;
    attendanceSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.punchIn && data.punchOut) {
        const start = data.punchIn instanceof Timestamp ? data.punchIn.toDate() : new Date(data.punchIn);
        const end = data.punchOut instanceof Timestamp ? data.punchOut.toDate() : new Date(data.punchOut);
        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
      }
    });

    return {
      completedCount: completed.length,
      activeCount: active,
      totalHours: Math.round(totalMinutes / 60),
      totalPayout
    };
  } catch (error) {
    console.error("Error getting developer stats:", error);
    return { completedCount: 0, activeCount: 0, totalHours: 0, totalPayout: 0 };
  }
};

export const getDeveloperAttendanceStatus = (uid: string, callback: (data: { isPunchedIn: boolean, punchIn: any }) => void) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const attendanceId = `${uid}_${dateStr}`;
  const attendanceRef = doc(db, 'attendance', attendanceId);
  
  return onSnapshot(attendanceRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({
        isPunchedIn: !!data.punchIn && !data.punchOut,
        punchIn: data.punchIn
      });
    } else {
      callback({ isPunchedIn: false, punchIn: null });
    }
  }, (error) => {
    console.error("Attendance listener error:", error);
  });
};

export const punchIn = async (userId: string) => {
  if (!currentUser || userId !== currentUser.uid) {
    toast.error("Identity verification failed.");
    return;
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const attendanceId = `${userId}_${dateStr}`;
  const attendanceRef = doc(db, 'attendance', attendanceId);
  
  try {
    const existing = await getDoc(attendanceRef);
    if (existing.exists() && existing.data().punchIn && !existing.data().punchOut) {
      toast.error("Already punched in today.");
      return;
    }

    await setDoc(attendanceRef, {
      userId: currentUser.uid,
      date: dateStr,
      punchIn: serverTimestamp(),
      punchOut: null,
      status: 'active',
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Update user status
    await updateDoc(doc(db, 'users', userId), {
      status: 'active',
      isPunchedIn: true,
      lastPunchIn: serverTimestamp()
    });

    // Send punch-in notification to Admin
    await createNotification({
      role: 'admin',
      type: 'punch_in',
      title: 'Developer Punched In',
      message: `${currentUser.displayName || currentUser.email || 'A developer'} has secured punch in protocol. Status: Active.`,
      userId: userId
    }).catch(err => console.error("Admin notification failure:", err));

    toast.success("PUNCH IN SECURED. IDENTITY VERIFIED.");
  } catch (error) {
    console.error("Attendance security failure:", error);
    handleFirestoreError(error, OperationType.WRITE, `attendance/${attendanceId}`);
  }
};

export const punchOut = async (userId: string) => {
  if (!currentUser || userId !== currentUser.uid) {
    toast.error("Identity verification failed.");
    return;
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const attendanceId = `${userId}_${dateStr}`;
  const attendanceRef = doc(db, 'attendance', attendanceId);
  
  try {
    const existing = await getDoc(attendanceRef);
    if (!existing.exists() || !existing.data().punchIn) {
      toast.error("You must punch in first.");
      return;
    }
    if (existing.data().punchOut) {
      toast.error("Already punched out today.");
      return;
    }

    await updateDoc(attendanceRef, {
      punchOut: serverTimestamp(),
      status: 'completed',
      updatedAt: serverTimestamp()
    });

    // Update user status
    await updateDoc(doc(db, 'users', userId), {
      status: 'online',
      isPunchedIn: false,
      lastPunchOut: serverTimestamp()
    });

    // Send punch-out notification to Admin
    await createNotification({
      role: 'admin',
      type: 'punch_out',
      title: 'Developer Punched Out',
      message: `${currentUser.displayName || currentUser.email || 'A developer'} has secured punch out protocol. Status: Online.`,
      userId: userId
    }).catch(err => console.error("Admin notification failure:", err));

    toast.success("PUNCH OUT SECURED. STATUS UPDATED.");
  } catch (error) {
    console.error("Attendance security failure:", error);
    handleFirestoreError(error, OperationType.WRITE, `attendance/${attendanceId}`);
  }
};

export const getAttendance = async (userId: string) => {
  const path = 'attendance';
  try {
    const q = query(collection(db, 'attendance'), where('userId', '==', userId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAllAttendance = async () => {
  const path = 'attendance';
  try {
    const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getProject = async (projectId: string) => {
  const path = `projects/${projectId}`;
  try {
    const docSnap = await getDoc(doc(db, 'projects', projectId));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Project : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const notifyDevelopersOfNewProject = async (project: any) => {
  try {
    const devsQuery = query(collection(db, 'users'), where('role', '==', 'developer'));
    const snapshot = await getDocs(devsQuery);
    const devs = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    
    for (const dev of devs) {
      await createNotification({
        userId: dev.uid,
        type: 'new_project_pool',
        title: 'New Project Available',
        message: `You've got a new project "${project.businessName || 'Project'}" waiting in the developer project pool. Check it out!`,
        projectId: project.id || ''
      });
    }
  } catch (error) {
    console.error("Failed to notify developers of new project:", error);
  }
};

// Project Operations
export const createProject = async (form: any) => {
  if (!currentUser) throw new Error("Auth required");
  const path = 'projects';
  
  // Strict Domain Check
  if (form.onboardingData?.domain) {
    const isTaken = await checkDomainInUse(form.onboardingData.domain);
    if (isTaken) {
      throw new Error(`Domain "${form.onboardingData.domain}" is already registered in our system.`);
    }
  }

  try {
    const docRef = await addDoc(collection(db, "projects"), {
      userId: currentUser.uid,
      userName: form.userName || '',
      userEmail: form.userEmail || '',
      userPhone: form.onboardingData?.phone || '',
      businessName: form.businessName,
      businessType: form.businessType || '',
      businessEmail: form.onboardingData?.businessEmail || '',
      businessPhone: form.onboardingData?.businessPhone || '',
      storeType: form.onboardingData?.storeType || 'online_store',
      location: form.onboardingData?.city || '',
      locationState: form.onboardingData?.state || '',
      country: form.onboardingData?.country || 'India',
      description: form.description || '',
      primaryColor: form.primaryColor || '#c7c42a',
      secondaryColor: form.secondaryColor || '#000000',
      plan: form.plan || 'basic',
      status: "Waiting for Review",
      developerId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      paymentStatus: form.paymentStatus || 'pending',
      progress: 0,
      isDeleted: false,
      isLocked: false,
      logoUrl: form.onboardingData?.logoUrl || '',
      documentsUrl: form.onboardingData?.documentsUrl || '',
      domain: form.onboardingData?.domain || '',
      requestedDomain: form.onboardingData?.requestedDomain || '',
      domainPreferences: form.onboardingData?.domainPreferences || '',
      onboardingData: form.onboardingData || null
    });

    const projectId = docRef.id;

    // Notify admins about the new project
    await createNotification({
      role: 'admin',
      type: 'new_project',
      title: 'New Mission Received',
      message: `A new project for ${form.businessName} has been submitted by ${form.userName}.`,
      projectId: projectId,
      clientName: form.userName
    });
    
    // Notify all developers about the new project in pool
    await notifyDevelopersOfNewProject({ id: projectId, businessName: form.businessName }).catch(err => {
      console.error("Failed to notify developers of new project:", err);
    });
    
    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateProject = async (projectId: string, updateData: any) => {
  const path = `projects/${projectId}`;
  try {
    const oldSnap = await getDoc(doc(db, 'projects', projectId));
    const oldData = oldSnap.exists() ? oldSnap.data() : null;
    
    await updateDoc(doc(db, 'projects', projectId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    if (oldData) {
      // Notify client when status changes
      if (updateData.status && updateData.status !== oldData.status) {
        await createNotification({
          userId: oldData.userId,
          type: 'progress',
          title: 'Project Status Updated',
          message: `Your project "${oldData.businessName}" is now ${updateData.status}.`,
          projectId: projectId
        });

        // Notify developers if project status is set to Waiting for Review
        if (updateData.status === 'Waiting for Review') {
          await notifyDevelopersOfNewProject({ id: projectId, businessName: oldData.businessName }).catch(err => {
            console.error("Failed to notify developers of project status change:", err);
          });
        }
      }

      // Notify admin when website URL is submitted
      if (updateData.websiteUrl && updateData.websiteUrl !== oldData.websiteUrl) {
         await createNotification({
          role: 'admin',
          type: 'system',
          title: 'Mission URL Submitted',
          message: `Developer has submitted a preview URL for project "${oldData.businessName}".`,
          projectId: projectId
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getProjectsAsync = async (userId?: string, developerId?: string) => {
  const path = 'projects';
  try {
    let q = query(collection(db, 'projects'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    
    // If not admin and no specific filter, force filter by current user
    if (!userId && !developerId) {
      const userDoc = currentUser ? await getDoc(doc(db, 'users', currentUser.uid)) : null;
      const role = userDoc?.exists() ? userDoc.data().role : 'client';
      const isAdmin = role === 'admin' || currentUser?.email === ADMIN_EMAIL;
      
      if (!isAdmin && currentUser) {
        // Default to client filter if not admin
        q = query(collection(db, 'projects'), where('userId', '==', currentUser.uid), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
      }
    } else if (userId) {
      q = query(collection(db, 'projects'), where('userId', '==', userId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    } else if (developerId) {
      q = query(collection(db, 'projects'), where('developerId', '==', developerId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getProjects = (callback: (projects: any[]) => void, userId?: string, role?: string) => {
  if (!currentUser) return;
  const path = 'projects';
  
  let q;
  
  if (role === 'client' && userId) {
    q = query(collection(db, 'projects'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(50));
  } else if (role === 'developer' && userId) {
    // My projects
    q = query(
      collection(db, "projects"),
      where("developerId", "==", currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  } else {
    // Admin or fallback - added limit
    q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(100));
  }

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project))
      .filter(p => p.isDeleted !== true);
    callback(projects);
  }, (error) => {
    // Don't throw for quota errors in background listeners
    if (error.message?.includes('Quota') || error.message?.includes('resource-exhausted')) {
       console.warn("Project listener paused due to quota");
       return;
    }
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const getUnassignedProjects = (callback: (projects: Project[]) => void) => {
  const path = 'projects';
  // Pending projects
  const q = query(
    collection(db, "projects"),
    where("status", "==", "Waiting for Review"),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project));
    callback(projects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

// Blog Operations
export const getBlogPosts = async () => {
  const path = 'blog_posts';
  try {
    const q = query(collection(db, 'blog_posts'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getBlogPostBySlug = async (slug: string) => {
  const path = 'blog_posts';
  try {
    const q = query(collection(db, 'blog_posts'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const getConversationId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const sendMessage = async (projectId: string, messageData: any) => {
  if (!currentUser) return;
  const path = `projects/${projectId}/messages`;
  try {
    const message = messageData.text || '';
    
    // Support both direct fields and messageData object
    const finalData = {
      ...messageData,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'projects', projectId, 'messages'), finalData);

    // Update project metadata
    await updateDoc(doc(db, 'projects', projectId), {
      lastMessage: message || (messageData.imageUrl || messageData.mediaUrl ? '📷 Photo' : 'New message'),
      lastMessageAt: serverTimestamp(),
      lastSenderId: currentUser.uid,
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const sendDirectMessage = async (recipientId: string, messageData: any) => {
  if (!currentUser) return;
  const conversationId = getConversationId(currentUser.uid, recipientId);
  const path = `conversations/${conversationId}`;
  try {
    const message = messageData.text || '';
    
    const convRef = doc(db, 'conversations', conversationId);
    const convDoc = await getDoc(convRef);
    let unreadCount = {};
    if (convDoc.exists()) {
      unreadCount = convDoc.data().unreadCount || {};
    }
    
    unreadCount[recipientId] = (unreadCount[recipientId] || 0) + 1;

    await setDoc(convRef, {
      lastMessage: message || (messageData.imageUrl || messageData.mediaUrl ? '📷 Photo' : 'New message'),
      lastMessageAt: serverTimestamp(),
      lastSenderId: currentUser.uid,
      participants: [currentUser.uid, recipientId],
      unreadCount,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    const finalData = {
      ...messageData,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
      status: messageData.status || 'sent'
    };

    const docRef = await addDoc(
      collection(db, "conversations", conversationId, "messages"),
      finalData
    );
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const markConversationAsSeen = async (conversationId: string, userId: string) => {
  const path = `conversations/${conversationId}`;
  try {
    const convDoc = await getDoc(doc(db, 'conversations', conversationId));
    if (convDoc.exists()) {
      const unreadCount = convDoc.data().unreadCount || {};
      unreadCount[userId] = 0;
      await updateDoc(doc(db, 'conversations', conversationId), { 
        unreadCount,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const toggleFavoriteConversation = async (userId: string, conversationId: string) => {
  const path = `users/${userId}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const favorites = userDoc.data().favoriteConversations || [];
      const isFavorite = favorites.includes(conversationId);
      const newFavorites = isFavorite 
        ? favorites.filter((id: string) => id !== conversationId)
        : [...favorites, conversationId];
      
      await updateDoc(doc(db, 'users', userId), {
        favoriteConversations: newFavorites
      });
      return !isFavorite;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
  return false;
};

export const getUnreadMessageCount = (userId: string, callback: (count: number) => void) => {
  if (!userId) return;

  // Real-time listener for all unread counts in conversations
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const unreadCount = data.unreadCount?.[userId] || 0;
      totalUnread += unreadCount;
    });
    callback(totalUnread);
  }, (error) => {
    console.error("Unread count listener error:", error);
  });
};

export const markProjectAsSeen = async (projectId: string, userId: string) => {
  const path = `projects/${projectId}`;
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (projectDoc.exists()) {
      const unreadCount = projectDoc.data().unreadCount || {};
      unreadCount[userId] = 0;
      await updateDoc(doc(db, 'projects', projectId), { 
        unreadCount,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getNotifications = (userId: string, callback: (notifications: any[]) => void, role?: string) => {
  const path = 'notifications';
  const q = role === 'admin' 
    ? query(collection(db, path), where('role', '==', 'admin'), orderBy('createdAt', 'desc'), limit(20))
    : query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20));
    
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};

export const deleteNotification = async (notificationId: string) => {
  await deleteDoc(doc(db, 'notifications', notificationId));
};

export const markMessageAsSeen = async (messageId: string, conversationId?: string, projectId?: string) => {
  try {
    if (conversationId) {
      await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
        status: 'seen',
        seen: true,
        seenTime: serverTimestamp()
      });
    } else if (projectId) {
      await updateDoc(doc(db, 'projects', projectId, 'messages', messageId), {
        status: 'seen',
        seen: true,
        seenTime: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error marking message as seen:', error);
  }
};

export const markMessageAsDelivered = async (messageId: string, conversationId?: string, projectId?: string) => {
  try {
    if (conversationId) {
      const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      const msgDoc = await getDoc(msgRef);
      if (msgDoc.exists() && msgDoc.data().status === 'sent') {
        await updateDoc(msgRef, {
          status: 'delivered',
          deliveredTime: serverTimestamp()
        });
      }
    } else if (projectId) {
      const msgRef = doc(db, 'projects', projectId, 'messages', messageId);
      const msgDoc = await getDoc(msgRef);
      if (msgDoc.exists() && msgDoc.data().status === 'sent') {
        await updateDoc(msgRef, {
          status: 'delivered',
          deliveredTime: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Error marking message as delivered:', error);
  }
};

export const deleteMessageForEveryone = async (messageId: string, conversationId?: string, projectId?: string) => {
  try {
    if (conversationId) {
      await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
        text: 'This message was deleted',
        fileData: null,
        attachments: null,
        deletedForEveryone: true
      });
    } else if (projectId) {
      await updateDoc(doc(db, 'projects', projectId, 'messages', messageId), {
        text: 'This message was deleted',
        fileData: null,
        attachments: null,
        deletedForEveryone: true
      });
    }
  } catch (error) {
    console.error('Error deleting message for everyone:', error);
  }
};

export const updateMessage = async (projectId: string, messageId: string, updateData: any) => {
  const path = `projects/${projectId}/messages/${messageId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId, 'messages', messageId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Meeting Operations
export const createMeeting = async (meetingData: Partial<Meeting>) => {
  const path = 'meetings';
  try {
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...meetingData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify Developer
    if (meetingData.developerId) {
      await createNotification({
        userId: meetingData.developerId,
        type: 'meeting',
        title: 'New Meeting Scheduled',
        message: `A new meeting "${meetingData.title}" has been scheduled for ${meetingData.date} at ${meetingData.time}.`,
        projectId: meetingData.projectId
      });
    }

    // Notify Client
    if (meetingData.clientId) {
      await createNotification({
        userId: meetingData.clientId,
        type: 'meeting',
        title: 'New Meeting Scheduled',
        message: `A new meeting "${meetingData.title}" has been scheduled for ${meetingData.date} at ${meetingData.time}.`,
        projectId: meetingData.projectId
      });
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateMeeting = async (meetingId: string, updateData: Partial<Meeting>) => {
  const path = `meetings/${meetingId}`;
  try {
    await updateDoc(doc(db, 'meetings', meetingId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getMeetings = (userId: string, role: string, callback: (meetings: Meeting[]) => void) => {
  const path = 'meetings';
  let q = query(collection(db, 'meetings'), orderBy('date', 'asc'), orderBy('time', 'asc'));
  
  if (role === 'client') {
    q = query(collection(db, 'meetings'), where('clientId', '==', userId), orderBy('date', 'asc'), orderBy('time', 'asc'));
  } else if (role === 'developer') {
    q = query(collection(db, 'meetings'), where('developerId', '==', userId), orderBy('date', 'asc'), orderBy('time', 'asc'));
  }

  return onSnapshot(q, (snapshot) => {
    const meetings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
    callback(meetings);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const getTodayMeetings = async (userId: string, role: string) => {
  const path = 'meetings';
  try {
    const today = new Date().toISOString().split('T')[0];
    let q = query(collection(db, 'meetings'), where('date', '==', today));
    
    if (role === 'client') {
      q = query(collection(db, 'meetings'), where('date', '==', today), where('clientId', '==', userId));
    } else if (role === 'developer') {
      q = query(collection(db, 'meetings'), where('date', '==', today), where('developerId', '==', userId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meeting));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateDirectMessage = async (recipientId: string, messageId: string, updateData: any) => {
  if (!currentUser) return;
  const conversationId = getConversationId(currentUser.uid, recipientId);
  const path = `conversations/${conversationId}/messages/${messageId}`;
  try {
    await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteMessage = async (projectId: string, messageId: string, forEveryone: boolean, userId: string) => {
  const path = `projects/${projectId}/messages/${messageId}`;
  try {
    if (forEveryone) {
      await updateDoc(doc(db, 'projects', projectId, 'messages', messageId), {
        text: 'This message was deleted',
        isDeleted: true,
      });
    } else {
      const docRef = doc(db, 'projects', projectId, 'messages', messageId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const hiddenFor = docSnap.data().hiddenFor || [];
        await updateDoc(docRef, {
          hiddenFor: [...hiddenFor, userId]
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const deleteDirectMessage = async (recipientId: string, messageId: string, forEveryone: boolean, currentUserId: string) => {
  const conversationId = getConversationId(currentUserId, recipientId);
  const path = `conversations/${conversationId}/messages/${messageId}`;
  try {
    if (forEveryone) {
      await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
        text: 'This message was deleted',
        isDeleted: true,
      });
    } else {
      const docRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const hiddenFor = docSnap.data().hiddenFor || [];
        await updateDoc(docRef, {
          hiddenFor: [...hiddenFor, currentUserId]
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getMessages = (projectId: string, callback: (messages: any[]) => void) => {
  const path = `projects/${projectId}/messages`;
  const q = query(collection(db, 'projects', projectId, 'messages'), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const getDirectMessages = (currentUserUid: string, recipientId: string, callback: (messages: any[]) => void) => {
  const conversationId = getConversationId(currentUserUid, recipientId);
  const path = `conversations/${conversationId}/messages`;
  const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const getProjectUnreadNotifications = (callback: (projects: any[]) => void) => {
  if (!currentUser) return;
  const path = 'projects';
  
  const isAdmin = currentUser.email?.toLowerCase() === 'workzy59@gmail.com';
  
  // Only listen to projects that have unread messages for admin
  const q = query(
    collection(db, 'projects'), 
    orderBy('updatedAt', 'desc'), 
    limit(30)
  );

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project))
      .filter(p => !p.isDeleted);
    callback(projects);
  }, (error) => {
    if (error.message?.includes('Quota')) return;
    console.debug("Unread notification listener error:", error);
  });
};

export const getConversations = (userId: string, callback: (conversations: any[]) => void) => {
  if (!currentUser) return;
  const path = 'conversations';
  // Conversations
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUser.uid),
    orderBy("updatedAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(conversations);
  }, (error) => {
    if (error.message?.includes('Quota')) return;
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

// System Settings Operations
export const getSystemSettings = async () => {
  const defaultSettings: SystemSettings = {
    id: 'default',
    requiredFields: {
      phone: true,
      businessName: true,
      businessType: true,
      businessNumber: true,
      businessLocation: true,
      description: true,
      websiteName: true,
      primaryColor: true,
      secondaryColor: true,
      logo: false,
      documents: false,
      referenceWebsite: false,
    },
    notifications: {
      newMessages: true,
      newProjects: true,
    },
    pricing: {
      starter: 1499,
      pro: 3499,
      enterprise: 9999
    },
    paymentLinks: {
      basic: 'https://rzp.io/rzp/N4YcMZq2',
      standard: 'https://rzp.io/rzp/rDHFQw2',
      premium: 'https://rzp.io/rzp/3H3lO1x'
    },
    maintenanceMode: false,
    allowNewRegistrations: true,
    baseWebsiteCost: 1499,
  };

  try {
    const docRef = doc(db, 'system_settings', 'default');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    }
    
    // If not exists, try to create ONLY if admin and logged in
    if (currentUser) {
      const isAdmin = currentUser.email === ADMIN_EMAIL;
      if (isAdmin) {
        try {
          await setDoc(docRef, defaultSettings);
        } catch (e) {
          console.warn("Silent failure initializing settings:", e);
        }
      }
    }
    
    return defaultSettings;
  } catch (error) {
    console.warn('System settings inaccessible, using defaults');
    return defaultSettings;
  }
};

export const updateSystemSettings = async (data: Partial<SystemSettings>) => {
  const path = 'system_settings/default';
  try {
    await updateDoc(doc(db, 'system_settings', 'default'), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteAllProjects = async () => {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Only the main admin can reset the database.");
  }
  
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const deletePromises = querySnapshot.docs.map(async (projectDoc) => {
      try {
        // Delete messages subcollection
        const messagesSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'messages'));
        const messageDeletePromises = messagesSnapshot.docs.map(mDoc => deleteDoc(mDoc.ref));
        await Promise.all(messageDeletePromises);
        
        // Delete the project document itself
        await deleteDoc(projectDoc.ref);
      } catch (err) {
        console.error(`Error deleting project ${projectDoc.id}:`, err);
        // Continue with others
      }
    });
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'projects');
  }
};

export const deleteAllUsers = async () => {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Only the main admin can reset users.");
  }
  
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const deletePromises = querySnapshot.docs.map(async (userDoc) => {
      try {
        const userData = userDoc.data();
        // DO NOT delete the main admin
        if (userData.email !== ADMIN_EMAIL) {
          await deleteDoc(userDoc.ref);
        }
      } catch (err) {
        console.error(`Error deleting user ${userDoc.id}:`, err);
      }
    });
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'users');
  }
};

// Developer Invite System
export const createDeveloperInvite = async (inviteData: any) => {
  await addDoc(collection(db, 'developer_invites'), inviteData);
};

export const getDeveloperInvites = async () => {
  const q = query(collection(db, 'developer_invites'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createDeveloperRequest = async (data: any) => {
  const path = 'developer_requests';
  try {
    const docRef = await addDoc(collection(db, 'developer_requests'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getInviteByCode = async (email: string, code: string) => {
  const q = query(
    collection(db, 'developer_invites'), 
    where('email', '==', email.trim().toLowerCase()), 
    where('code', '==', code.trim().toUpperCase()),
    where('used', '==', false)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const markInviteUsed = async (inviteId: string) => {
  const docRef = doc(db, 'developer_invites', inviteId);
  await updateDoc(docRef, { used: true });
};

// Activity Tracking
export const createVisitSession = async (userId: string) => {
  const sessionId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const docRef = doc(db, 'visit_sessions', sessionId);
  try {
    await setDoc(docRef, {
      userId,
      startTime: serverTimestamp(),
      durationMinutes: 0
    }, { merge: true });
    return sessionId;
  } catch (error) {
    // If it's a 'Document already exists' error, we just return the ID as it's already there
    if (error instanceof Error && error.message.includes('already exists')) {
      return sessionId;
    }
    return handleFirestoreError(error, OperationType.CREATE, 'visit_sessions');
  }
};

export const endVisitSession = async (sessionId: string) => {
  if (!auth.currentUser) return; // Skip if user already signed out during cleanup
  const docRef = doc(db, 'visit_sessions', sessionId);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.startTime) {
        const startTime = data.startTime.toDate();
        const endTime = new Date();
        const durationMinutes = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)));
        await updateDoc(docRef, {
          endTime: serverTimestamp(),
          durationMinutes: durationMinutes
        });
      }
    }
  } catch (err: any) {
    // Suppress permission errors if they occur during logout race conditions
    if (err.message?.includes('permission-denied') || err.message?.includes('insufficient permissions')) {
      console.debug("Silent failure: Permission denied ending visit session (likely signed out)");
      return;
    }
    console.error("Error ending visit session:", err);
  }
};

export const getVisitSessions = async (userId?: string, role?: string) => {
  const isTrulyAdmin = role === 'admin' || currentUser?.email === ADMIN_EMAIL;
  
  let q;
  if (isTrulyAdmin) {
    if (userId) {
      q = query(collection(db, 'visit_sessions'), where('userId', '==', userId), orderBy('startTime', 'desc'), limit(100));
    } else {
      q = query(collection(db, 'visit_sessions'), orderBy('startTime', 'desc'), limit(100));
    }
  } else {
    // Force filter by current user if not truly admin
    q = query(collection(db, 'visit_sessions'), where('userId', '==', currentUser?.uid), orderBy('startTime', 'desc'), limit(50));
  }
  
  try {
    if (!currentUser) return [];
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
  } catch (error: any) {
    if (error.message?.includes('Quota')) {
       console.warn("Quota exceeded fetching sessions");
       return [];
    }
    console.error("Error fetching visit sessions:", error);
    return [];
  }
};

export const getPayments = async (developerId: string) => {
  console.warn("Forbidden query: getPayments");
  return [];
};

export const verifyDeveloperInvite = getInviteByCode;
export const useDeveloperInvite = markInviteUsed;

export const toggleMessageReaction = async (projectId: string, messageId: string, emoji: string, userId: string) => {
  const docRef = doc(db, 'projects', projectId, 'messages', messageId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    
    const reactions = snap.data().reactions || {};
    const emojiReactions = reactions[emoji] || [];
    const hasReacted = emojiReactions.includes(userId);

    await updateDoc(docRef, {
      [`reactions.${emoji}`]: hasReacted ? arrayRemove(userId) : arrayUnion(userId)
    });
  } catch (error) {
    console.error("Error toggling reaction:", error);
  }
};

export const toggleDirectMessageReaction = async (recipientId: string, messageId: string, emoji: string, currentUserId: string) => {
  const conversationId = getConversationId(currentUserId, recipientId);
  const docRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const reactions = snap.data().reactions || {};
    const emojiReactions = reactions[emoji] || [];
    const hasReacted = emojiReactions.includes(currentUserId);

    await updateDoc(docRef, {
      [`reactions.${emoji}`]: hasReacted ? arrayRemove(currentUserId) : arrayUnion(currentUserId)
    });
  } catch (error) {
    console.error("Error toggling direct reaction:", error);
  }
};
