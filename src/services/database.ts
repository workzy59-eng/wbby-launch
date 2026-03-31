import { 
  db, auth, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, Timestamp 
} from '../firebase';
import { FirebaseUser } from '../firebase';
import { ADMIN_EMAIL } from '../constants';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

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
export const createUserProfile = async (user: FirebaseUser) => {
  const path = `users/${user.uid}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.email === ADMIN_EMAIL ? 'admin' : 'client',
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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

// Project Operations
export const createProject = async (projectData: any) => {
  const path = 'projects';
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      status: 'Waiting for Review',
      progress: 0,
      isDeleted: false,
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

export const getProjects = (callback: (projects: any[]) => void, userId?: string) => {
  const path = 'projects';
  let q = query(collection(db, 'projects'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
  
  if (userId) {
    q = query(collection(db, 'projects'), where('userId', '==', userId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
  }

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(projects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

// Message Operations
export const sendMessage = async (projectId: string, messageData: any) => {
  const path = `projects/${projectId}/messages`;
  try {
    await addDoc(collection(db, 'projects', projectId, 'messages'), {
      ...messageData,
      projectId,
      createdAt: serverTimestamp(),
      seen: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const sendDirectMessage = async (userId: string, messageData: any) => {
  const path = `direct_messages/${userId}/messages`;
  try {
    await addDoc(collection(db, 'direct_messages', userId, 'messages'), {
      ...messageData,
      createdAt: serverTimestamp(),
      seen: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
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

export const updateDirectMessage = async (userId: string, messageId: string, updateData: any) => {
  const path = `direct_messages/${userId}/messages/${messageId}`;
  try {
    await updateDoc(doc(db, 'direct_messages', userId, 'messages', messageId), updateData);
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

export const deleteDirectMessage = async (userId: string, messageId: string, forEveryone: boolean, currentUserId: string) => {
  const path = `direct_messages/${userId}/messages/${messageId}`;
  try {
    if (forEveryone) {
      await updateDoc(doc(db, 'direct_messages', userId, 'messages', messageId), {
        text: 'This message was deleted',
        isDeleted: true,
      });
    } else {
      const docRef = doc(db, 'direct_messages', userId, 'messages', messageId);
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

export const getDirectMessages = (userId: string, callback: (messages: any[]) => void) => {
  const path = `direct_messages/${userId}/messages`;
  const q = query(collection(db, 'direct_messages', userId, 'messages'), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
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
