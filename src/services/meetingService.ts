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
import { Meeting, MeetingStatus } from '../types';

const COLLECTION_NAME = 'meetings';

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

export const subscribeToMeetings = (
  role: 'admin' | 'client',
  userId: string,
  callback: (meetings: Meeting[]) => void
) => {
  let q;
  if (role === 'admin') {
    q = query(collection(db, COLLECTION_NAME), orderBy('date', 'asc'), orderBy('time', 'asc'));
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
    console.error("Error subscribing to meetings:", error);
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
