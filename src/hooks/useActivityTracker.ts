import { useEffect, useRef } from 'react';
import { createVisitSession, endVisitSession } from '../services/database';

export function useActivityTracker(userId: string | undefined) {
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const startSession = async () => {
      try {
        const id = await createVisitSession(userId);
        sessionIdRef.current = id;
      } catch (err) {
        console.error("Failed to start visit session:", err);
      }
    };

    startSession();

    const handleEndSession = () => {
      if (sessionIdRef.current) {
        // Use sendBeacon or sync request to ensure it sends before tab closes
        // However, endVisitSession is async. 
        // For reliability in React, we call it on unmount.
        // For tab close, we might need a more robust solution, but let's stick to standard unmount for now.
        endVisitSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleEndSession);

    return () => {
      handleEndSession();
      window.removeEventListener('beforeunload', handleEndSession);
    };
  }, [userId]);
}
