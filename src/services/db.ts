import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';

// Generic CRUD operations
export const dbService = {
  // COLLECTIONS
  CANDIDATES: 'candidates',
  JOBS: 'jobs',
  AGENTS: 'agents',
  LOGS: 'logs',

  async create(path: string, data: any) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      return await addDoc(collection(db, path), {
        ...data,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async update(path: string, id: string, data: any) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      const docRef = doc(db, path, id);
      return await updateDoc(docRef, {
        ...data,
        // userId: auth.currentUser.uid, // Should not change
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
    }
  },

  async delete(path: string, id: string) {
    if (!auth.currentUser) throw new Error('Not authenticated');
    try {
      return await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  },

  // Real-time listener for user's own data
  subscribeToUserCollection(path: string, callback: (data: any[]) => void) {
    if (!auth.currentUser) return () => {};
    
    const q = query(
      collection(db, path), 
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
      }));
      callback(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};
