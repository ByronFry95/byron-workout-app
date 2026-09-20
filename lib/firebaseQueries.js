import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

// Workouts Collection
export async function saveWorkoutDays(userId, days) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { workoutDays: days }, { merge: true });
  } catch (error) {
    console.error('Error saving workout days:', error);
    throw error;
  }
}

export async function saveWorkoutSession(userId, session) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { workoutSession: session }, { merge: true });
  } catch (error) {
    console.error('Error saving workout session:', error);
    throw error;
  }
}

export async function getWorkoutSession(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists() && docSnap.data().workoutSession) {
      return docSnap.data().workoutSession;
    }
    return null;
  } catch (error) {
    console.error('Error fetching workout session:', error);
    return null;
  }
}

export async function getWorkoutDays(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists() && docSnap.data().workoutDays) {
      return docSnap.data().workoutDays;
    }
    return [];
  } catch (error) {
    console.error('Error fetching workout days:', error);
    throw error;
  }
}

// Completed workout logs
export async function saveWorkoutLog(userId, workoutLog) {
  try {
    const logsRef = collection(db, 'users', userId, 'workoutLogs');
    const logRef = workoutLog.id ? doc(logsRef, workoutLog.id) : doc(logsRef);
    const logData = { ...workoutLog, id: undefined, updatedAt: new Date().toISOString() };
    delete logData.id;
    await setDoc(logRef, logData, { merge: true });
    return logRef.id;
  } catch (error) {
    console.error('Error saving workout log:', error);
    throw error;
  }
}

export async function getWorkoutLogs(userId, limitCount = 20) {
  try {
    const logsRef = collection(db, 'users', userId, 'workoutLogs');
    const q = query(logsRef, orderBy('startedAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((logDoc) => {
      logs.push({ id: logDoc.id, ...logDoc.data() });
    });

    return logs;
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    throw error;
  }
}

export async function updateWorkoutLog(userId, logId, updates) {
  try {
    const logRef = doc(db, 'users', userId, 'workoutLogs', logId);
    await setDoc(logRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('Error updating workout log:', error);
    throw error;
  }
}

export async function deleteWorkoutLog(userId, logId) {
  try {
    const logRef = doc(db, 'users', userId, 'workoutLogs', logId);
    await deleteDoc(logRef);
  } catch (error) {
    console.error('Error deleting workout log:', error);
    throw error;
  }
}

// Metrics Collection
export async function saveMetrics(userId, metricsEntry) {
  try {
    const metricsRef = collection(db, 'users', userId, 'metrics');
    const newDocRef = doc(metricsRef);
    await setDoc(newDocRef, {
      ...metricsEntry,
      timestamp: new Date().toISOString()
    });
    return newDocRef.id;
  } catch (error) {
    console.error('Error saving metrics:', error);
    throw error;
  }
}

export async function getMetricsHistory(userId) {
  try {
    const metricsRef = collection(db, 'users', userId, 'metrics');
    const q = query(metricsRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const metrics = [];
    querySnapshot.forEach((doc) => {
      metrics.push({ id: doc.id, ...doc.data() });
    });
    
    return metrics;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
}

export async function deleteMetricsEntry(userId, entryId) {
  try {
    const entryRef = doc(db, 'users', userId, 'metrics', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting metrics entry:', error);
    throw error;
  }
}
