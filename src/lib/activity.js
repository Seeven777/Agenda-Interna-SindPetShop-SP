import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from './firestore-errors';
export const logActivity = async (userId, userName, type, resource, details) => {
    try {
        await addDoc(collection(db, 'activityLog'), {
            userId,
            userName,
            type,
            resource,
            details,
            timestamp: serverTimestamp(),
        });
    }
    catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'activityLog');
    }
};
