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
    return [];
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
    return [];
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
