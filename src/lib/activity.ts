import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from './firestore-errors';

export type ActivityType = 'create' | 'update' | 'delete' | 'login';
export type ResourceType = 'case' | 'task' | 'event' | 'announcement' | 'user';

export const logActivity = async (
  userId: string,
  userName: string,
  type: ActivityType,
  resource: ResourceType,
  details: string
) => {
  try {
    await addDoc(collection(db, 'activityLog'), {
      userId,
      userName,
      type,
      resource,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'activityLog');
  }
};
