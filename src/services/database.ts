import { 
  db, auth, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, Timestamp, limit,
  ref, uploadBytes, getDownloadURL, storage, getDocFromServer, arrayUnion, arrayRemove
} from '../firebase';
import { FirebaseUser } from '../firebase';
import { UserProfile, Project, Message, LeaveRequest, Attendance, BlogPost, SystemSettings, Meeting } from '../types';
import { ADMIN_EMAIL } from '../constants';
import { toast } from 'react-hot-toast';

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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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

// File Upload Helper (Base64 conversion)
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Corrected upload helper using Cloudinary (Client-side)
export const uploadFile = async (file: File, folder: string = 'uploads'): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.warn('Cloudinary credentials missing, falling back to Base64');
    return await convertFileToBase64(file);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return await convertFileToBase64(file);
  }
};


// User Profile Operations
export const createUserProfile = async (user: FirebaseUser, additionalData: any = {}) => {
  if (!user?.uid) return;
  const path = `users/${user.uid}`;
  try {
    let role = 'client';
    const adminEmails = [ADMIN_EMAIL.toLowerCase(), 'workzy59@gmail.com', 'sain17296174@gmail.com'];
    const devEmails = ['aither2029@gmail.com'];
    
    if (adminEmails.includes(user.email?.toLowerCase() || '')) {
      role = 'admin';
    } else if (devEmails.includes(user.email?.toLowerCase() || '')) {
      role = 'developer';
    }

    // PART 1: Strict merge using setDoc
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: role,
      status: 'online',
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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

export const getUserProfile = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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

export const getProfiles = async () => {
  const path = 'users';
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getAdmins = async () => {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getClients = async () => {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'client'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// Leave Operations
export const requestLeave = async (leaveData: any) => {
  const path = 'leave_requests';
  try {
    await addDoc(collection(db, 'leave_requests'), {
      ...leaveData,
      createdAt: serverTimestamp(),
    });
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

export const updateLeaveRequest = async (requestId: string, status: string) => {
  const path = `leave_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'leave_requests', requestId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Attendance Operations
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

// Project Operations
export const createProject = async (projectData: any) => {
  const path = 'projects';
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'Waiting for Review',
      paymentStatus: projectData.paymentStatus || 'paid', // Default to paid to allow usage without paying
      progress: 0,
      isDeleted: false,
      isLocked: false, // Unlock by default if allowed without paying
    });

    const projectId = docRef.id;

    try {
      const admins = await getAdmins();
      if (admins.length > 0) {
        const admin = admins.find(a => a.email === ADMIN_EMAIL) || admins[0];
        const adminUid = admin.uid;
        const clientUid = projectData.userId;
        const clientName = projectData.userName || 'Client';
        
        const conversationId = getConversationId(adminUid, clientUid);
        const welcomeMessage = `Hi ${clientName},\n\nWelcome to WebbyLaunch! 🚀\n\nYour project "${projectData.businessName}" has been successfully received. We've assigned our team to review your requirements.\n\nYou can use this chat to talk directly with us. We'll update your project status in the dashboard as we progress.\n\nBest,\nTeam Webbylaunch`;

        try {
          // Find the specific developer aither2029@gmail.com
          const devQ = query(collection(db, 'users'), where('email', '==', 'aither2029@gmail.com'));
          const devSnap = await getDocs(devQ);
          
          if (!devSnap.empty) {
            const assignedDev = { uid: devSnap.docs[0].id, ...devSnap.docs[0].data() } as UserProfile;
            await updateDoc(doc(db, 'projects', projectId), {
              assignedTo: assignedDev.uid,
              developerId: assignedDev.uid,
              assignedAt: serverTimestamp(),
              status: 'Under Review'
            });

            await updateDoc(doc(db, 'users', assignedDev.uid), {
              activeProjects: ((assignedDev as any).activeProjects || 0) + 1,
              role: 'developer' // Double check role
            });
          } else {
            // Fallback to previous logic if specific dev not found
            const degsQ = query(collection(db, 'users'), where('role', '==', 'developer'), where('status', '==', 'approved'));
            const devsSnap = await getDocs(degsQ);
            const devs = devsSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));

            if (devs.length > 0) {
              const sortedDevs = devs.sort((a, b) => {
                const projectsA = (a as any).activeProjects || 0;
                const projectsB = (b as any).activeProjects || 0;
                if (projectsA !== projectsB) return projectsA - projectsB;

                const expA = parseInt(String(a.experience || '0'), 10);
                const expB = parseInt(String(b.experience || '0'), 10);
                return expB - expA;
              });

              const assignedDev = sortedDevs[0];
              await updateDoc(doc(db, 'projects', projectId), {
                assignedTo: assignedDev.uid,
                developerId: assignedDev.uid,
                assignedAt: serverTimestamp(),
                status: 'Under Review'
              });

              await updateDoc(doc(db, 'users', assignedDev.uid), {
                activeProjects: ((assignedDev as any).activeProjects || 0) + 1
              });
            }
          }
        } catch (assignError) {
          console.error('Auto-assignment failed:', assignError);
        }

        await setDoc(doc(db, 'conversations', conversationId), {
          participants: [adminUid, clientUid],
          lastMessage: welcomeMessage,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          unreadCount: {
            [clientUid]: 1,
            [adminUid]: 0
          },
          lastSenderId: adminUid,
          projectId: projectId 
        }, { merge: true });

        await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
          text: welcomeMessage,
          senderId: adminUid,
          senderName: 'Team Webbylaunch',
          conversationId,
          createdAt: serverTimestamp(),
          status: 'sent',
          seen: false
        });
      }
    } catch (msgError) {
      console.error("Error creating conversation or welcome message:", msgError);
    }

    return projectId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateProject = async (projectId: string, updateData: any) => {
  const path = `projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
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
      const userDoc = auth.currentUser ? await getDoc(doc(db, 'users', auth.currentUser.uid)) : null;
      const role = userDoc?.exists() ? userDoc.data().role : 'client';
      const isAdmin = role === 'admin' || auth.currentUser?.email === ADMIN_EMAIL;
      
      if (!isAdmin && auth.currentUser) {
        // Default to client filter if not admin
        q = query(collection(db, 'projects'), where('userId', '==', auth.currentUser.uid), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
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
  const path = 'projects';
  // Use a more lenient query that doesn't strictly require isDeleted field for existing docs
  let q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
  
  if (role === 'client' && userId) {
    q = query(collection(db, 'projects'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  } else if (role === 'developer' && userId) {
    q = query(collection(db, 'projects'), where('developerId', '==', userId), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    // Filter in-memory for isDeleted for better robustness with existing docs
    const projects = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Project))
      .filter(p => p.isDeleted !== true);
    callback(projects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const getUnassignedProjects = (callback: (projects: Project[]) => void) => {
  const path = 'projects';
  const q = query(
    collection(db, 'projects'), 
    where('developerId', '==', null),
    where('isDeleted', '==', false), 
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
  if (!auth.currentUser) return;
  const path = `projects/${projectId}/messages`;
  try {
    const text = messageData.text || null;
    const type = messageData.type || (messageData.imageUrl || messageData.mediaUrl ? 'image' : 'text');
    const imageUrl = messageData.imageUrl || messageData.mediaUrl || null;

    const docRef = await addDoc(collection(db, 'projects', projectId, 'messages'), {
      text,
      imageUrl,
      senderId: auth.currentUser.uid,
      senderName: messageData.senderName || auth.currentUser.displayName || 'User',
      type,
      createdAt: serverTimestamp(),
      seen: false,
      status: 'sent',
      reactions: {},
      replyTo: messageData.replyTo || null,
    });

    // Update project metadata
    await updateDoc(doc(db, 'projects', projectId), {
      lastMessage: text || (imageUrl ? '📷 Photo' : 'New message'),
      lastMessageAt: serverTimestamp(),
      lastSenderId: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const sendDirectMessage = async (recipientId: string, messageData: any) => {
  if (!auth.currentUser) return;
  const conversationId = getConversationId(auth.currentUser.uid, recipientId);
  const path = `conversations/${conversationId}`;
  try {
    const text = messageData.text || '';
    const type = messageData.type || (messageData.fileUrl || messageData.mediaUrl || messageData.fileData ? 'image' : 'text');
    const mediaUrl = messageData.mediaUrl || messageData.fileUrl || messageData.imageUrl || messageData.fileData || null;

    const convRef = doc(db, 'conversations', conversationId);
    const convDoc = await getDoc(convRef);
    let unreadCount = {};
    if (convDoc.exists()) {
      unreadCount = convDoc.data().unreadCount || {};
    }
    
    unreadCount[recipientId] = (unreadCount[recipientId] || 0) + 1;

    let lastMessagePreview = text;
    if (type === 'image') lastMessagePreview = '📷 Image';
    else if (type === 'video') lastMessagePreview = '🎥 Video';
    else if (type === 'file') lastMessagePreview = '📁 File';

    await setDoc(convRef, {
      lastMessage: lastMessagePreview,
      lastMessageAt: serverTimestamp(),
      lastSenderId: auth.currentUser.uid,
      participants: [auth.currentUser.uid, recipientId],
      unreadCount,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    const docRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      ...messageData,
      text,
      type,
      mediaUrl,
      conversationId,
      createdAt: serverTimestamp(),
      status: 'sent',
      seen: false,
      attachments: messageData.attachments || [],
      replyTo: messageData.replyTo || null,
      reactions: {},
    });
    
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
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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
  if (!auth.currentUser) return;
  const conversationId = getConversationId(auth.currentUser.uid, recipientId);
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

export const getConversations = (userId: string, callback: (conversations: any[]) => void) => {
  const path = 'conversations';
  const q = query(
    collection(db, 'conversations'), 
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(conversations);
  }, (error) => {
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
    if (auth.currentUser) {
      const isAdmin = auth.currentUser.email === ADMIN_EMAIL;
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
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
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
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
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
  try {
    const docRef = await addDoc(collection(db, 'visit_sessions'), {
      userId,
      startTime: serverTimestamp(),
      durationMinutes: 0
    });
    return docRef.id;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, 'visit_sessions');
  }
};

export const endVisitSession = async (sessionId: string) => {
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
  } catch (err) {
    console.error("Error ending visit session:", err);
  }
};

export const getVisitSessions = async (userId?: string, role?: string) => {
  const isTrulyAdmin = role === 'admin' || auth.currentUser?.email === ADMIN_EMAIL;
  
  let q;
  if (isTrulyAdmin) {
    if (userId) {
      q = query(collection(db, 'visit_sessions'), where('userId', '==', userId), orderBy('startTime', 'desc'));
    } else {
      q = query(collection(db, 'visit_sessions'), orderBy('startTime', 'desc'));
    }
  } else {
    // Force filter by current user if not truly admin
    q = query(collection(db, 'visit_sessions'), where('userId', '==', auth.currentUser?.uid), orderBy('startTime', 'desc'));
  }
  
  try {
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
  } catch (error) {
    console.error("Error fetching visit sessions:", error);
    return [];
  }
};

export const getPayments = async (developerId: string) => {
  const path = 'payments';
  try {
    const q = query(collection(db, 'payments'), where('developerId', '==', developerId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
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
