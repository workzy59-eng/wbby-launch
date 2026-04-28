import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './database';
import { Meeting, MeetingStatus, MeetingRequest } from '../types';

const COLLECTION_NAME = 'meetings';
const REQUESTS_COLLECTION = 'meeting_requests';

export const createMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...meetingData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateMeeting = async (meetingId: string, updates: Partial<Meeting>) => {
  const meetingRef = doc(db, COLLECTION_NAME, meetingId);
  return await updateDoc(meetingRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteMeeting = async (meetingId: string) => {
  const meetingRef = doc(db, COLLECTION_NAME, meetingId);
  return await deleteDoc(meetingRef);
};

export const createMeetingRequest = async (requestData: Omit<MeetingRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  return await addDoc(collection(db, REQUESTS_COLLECTION), {
    ...requestData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const updateMeetingRequest = async (requestId: string, updates: Partial<MeetingRequest>) => {
  const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
  return await updateDoc(requestRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const subscribeToMeetingRequests = (
  role: 'admin' | 'client' | 'developer',
  userId: string,
  callback: (requests: MeetingRequest[]) => void
) => {
  let q;
  if (role === 'admin') {
    q = query(collection(db, REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
  } else if (role === 'developer') {
    // Developers don't usually see requests, but if they do, filter by relevant projects/clients
    // For now, same as admin or empty. Let's assume empty for developers unless specifically requested.
    q = query(collection(db, REQUESTS_COLLECTION), where('developerId', '==', userId), orderBy('createdAt', 'desc'));
  } else {
    q = query(
      collection(db, REQUESTS_COLLECTION), 
      where('clientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MeetingRequest[];
    callback(requests);
  }, (error) => {
    console.error("Error subscribing to meeting requests:", error);
  });
};

export const subscribeToMeetings = (
  role: 'admin' | 'client' | 'developer',
  userId: string,
  callback: (meetings: Meeting[]) => void
) => {
  let q;
  if (role === 'admin') {
    q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'), orderBy('time', 'asc'));
  } else if (role === 'developer') {
    q = query(
      collection(db, COLLECTION_NAME), 
      where('developerId', '==', userId),
      orderBy('date', 'asc'), 
      orderBy('time', 'asc')
    );
  } else {
    q = query(
      collection(db, COLLECTION_NAME), 
      where('clientId', '==', userId),
      orderBy('date', 'asc'), 
      orderBy('time', 'asc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const meetings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Meeting[];
    callback(meetings);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

export const detectPlatform = (url: string): 'Google Meet' | 'Zoom' | null => {
  if (url.includes('meet.google.com')) return 'Google Meet';
  if (url.includes('zoom.us')) return 'Zoom';
  return null;
};

export const validateMeetingLink = (url: string): { isValid: boolean; error?: string } => {
  if (!url) return { isValid: false, error: 'Meeting link is required' };
  if (!url.startsWith('https://')) return { isValid: false, error: 'Must start with https://' };
  
  const platform = detectPlatform(url);
  if (!platform) return { isValid: false, error: 'Only Google Meet or Zoom links are allowed' };
  
  return { isValid: true };
};
