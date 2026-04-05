import { 
  db, auth, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, Timestamp,
  ref, uploadBytes, getDownloadURL, storage
} from '../firebase';
import { FirebaseUser } from '../firebase';
import { UserProfile, Project, Message, LeaveRequest, Attendance, BlogPost, SystemSettings } from '../types';
import { ADMIN_EMAIL } from '../constants';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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

// Legacy upload helper - now uses Base64
export const uploadFile = async (file: File, folder: string = 'uploads'): Promise<string> => {
  console.log(`Converting ${file.name} to Base64...`);
  try {
    const base64 = await convertFileToBase64(file);
    return base64;
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw error;
  }
};

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Profile Operations
export const createUserProfile = async (user: FirebaseUser, additionalData: any = {}) => {
  const path = `users/${user.uid}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'client',
        status: 'online',
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...additionalData
      });
    } else {
      await updateDoc(doc(db, 'users', user.uid), {
        updatedAt: serverTimestamp(),
        status: 'online',
        lastSeen: serverTimestamp(),
        ...additionalData
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateUserStatus = async (uid: string, status: 'online' | 'offline' | 'away') => {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      status,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // Silently fail for status updates to avoid UI noise
    console.warn('Status update failed:', error);
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
  });
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

// Project Operations
export const createProject = async (projectData: any) => {
  const path = 'projects';
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'Waiting for Review',
      progress: 0,
      isDeleted: false,
      isLocked: true, // Default to locked
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateProject = async (projectId: string, updateData: any) => {
  const path = `projects/${projectId}`;
  try {
    await updateDoc(doc(db, 'projects', projectId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getProjectsAsync = async (userId?: string, developerId?: string) => {
  const path = 'projects';
  try {
    let q = query(collection(db, 'projects'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    if (userId) {
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

export const getProjects = (callback: (projects: any[]) => void, userId?: string) => {
  const path = 'projects';
  let q = query(collection(db, 'projects'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
  
  if (userId) {
    q = query(collection(db, 'projects'), where('userId', '==', userId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
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

// Message Operations
export const getConversationId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const sendMessage = async (projectId: string, messageData: any) => {
  const path = `projects/${projectId}/messages`;
  try {
    await addDoc(collection(db, 'projects', projectId, 'messages'), {
      ...messageData,
      projectId,
      createdAt: serverTimestamp(),
      seen: false,
      attachments: messageData.attachments || [],
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const sendDirectMessage = async (recipientId: string, messageData: any) => {
  if (!auth.currentUser) return;
  const conversationId = getConversationId(auth.currentUser.uid, recipientId);
  const path = `conversations/${conversationId}/messages`;
  try {
    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      ...messageData,
      conversationId,
      createdAt: serverTimestamp(),
      seen: false,
      attachments: messageData.attachments || [],
    });
    
    // Update conversation metadata for list view
    await setDoc(doc(db, 'conversations', conversationId), {
      lastMessage: messageData.text || (messageData.attachments?.length ? 'Sent an attachment' : ''),
      lastMessageAt: serverTimestamp(),
      lastSenderId: auth.currentUser.uid,
      participants: [auth.currentUser.uid, recipientId],
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const markMessageAsSeen = async (messageId: string, conversationId?: string, projectId?: string) => {
  try {
    if (conversationId) {
      await updateDoc(doc(db, 'conversations', conversationId, 'messages', messageId), {
        seen: true,
        seenTime: serverTimestamp()
      });
    } else if (projectId) {
      await updateDoc(doc(db, 'projects', projectId, 'messages', messageId), {
        seen: true,
        seenTime: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error marking message as seen:', error);
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

export const getDirectMessages = (recipientId: string, callback: (messages: any[]) => void) => {
  if (!auth.currentUser) return () => {};
  const conversationId = getConversationId(auth.currentUser.uid, recipientId);
  const path = `conversations/${conversationId}/messages`;
  const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const getConversations = (callback: (conversations: any[]) => void) => {
  if (!auth.currentUser) return () => {};
  const path = 'conversations';
  const q = query(
    collection(db, 'conversations'), 
    where('participants', 'array-contains', auth.currentUser.uid)
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
  const path = 'system_settings/default';
  try {
    const docSnap = await getDoc(doc(db, 'system_settings', 'default'));
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    } else {
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
      };
      await setDoc(doc(db, 'system_settings', 'default'), defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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
  
  const path = 'projects';
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const deletePromises = querySnapshot.docs.map(async (projectDoc) => {
      // Delete messages subcollection
      const messagesSnapshot = await getDocs(collection(db, 'projects', projectDoc.id, 'messages'));
      const messageDeletePromises = messagesSnapshot.docs.map(mDoc => deleteDoc(mDoc.ref));
      await Promise.all(messageDeletePromises);
      
      // Delete the project document itself
      await deleteDoc(projectDoc.ref);
    });
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const deleteAllUsers = async () => {
  if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Only the main admin can reset users.");
  }
  
  const path = 'users';
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const deletePromises = querySnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      // DO NOT delete the main admin
      if (userData.email !== ADMIN_EMAIL) {
        await deleteDoc(userDoc.ref);
      }
    });
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
