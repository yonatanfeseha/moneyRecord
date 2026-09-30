import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config.js";

const recordsRef = collection(db, "records");

// Real-time listener: the table refreshes automatically after add/edit/delete.
// Sorting is done client-side (date desc, then createdAt desc) so no composite index is needed.
export function subscribeToRecords(onData, onError) {
  return onSnapshot(
    recordsRef,
    (snapshot) => {
      const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const ts = (r) =>
        r.createdAt?.toMillis ? r.createdAt.toMillis() : Date.now();
      records.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return ts(b) - ts(a);
      });
      onData(records);
    },
    onError,
  );
}

export const addRecord = ({ date, receiverName, reason, amount, method }) =>
  addDoc(recordsRef, {
    date,
    receiverName,
    reason,
    amount,
    method,
    createdAt: serverTimestamp(),
  });

export const updateRecord = (
  id,
  { date, receiverName, reason, amount, method },
) =>
  updateDoc(doc(db, "records", id), {
    date,
    receiverName,
    reason,
    amount,
    method,
  });

export const deleteRecord = (id) => deleteDoc(doc(db, "records", id));
