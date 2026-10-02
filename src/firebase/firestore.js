import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "./config.js";

const recordsRef = collection(db, "records");

// Each signed-in user subscribes only to records they own.
// Firestore Security Rules independently enforce this ownership.
export function subscribeToRecords(uid, onData, onError) {
  const userRecordsQuery = query(recordsRef, where("ownerUid", "==", uid));

  return onSnapshot(
    userRecordsQuery,
    (snapshot) => {
      const records = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const ts = (r) =>
        r.createdAt?.toMillis ? r.createdAt.toMillis() : 0;

      records.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return ts(b) - ts(a);
      });
      onData(records);
    },
    onError,
  );
}

export const addRecord = ({ date, receiverName, reason, amount, type, method }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to add a record.");

  return addDoc(recordsRef, {
    date,
    receiverName,
    reason,
    amount,
    type: type === "debit" ? "debit" : "credit",
    method,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
  });
};

export const updateRecord = (
  id,
  { date, receiverName, reason, amount, type, method },
) =>
  updateDoc(doc(db, "records", id), {
    date,
    receiverName,
    reason,
    amount,
    type: type === "debit" ? "debit" : "credit",
    method,
  });

export const deleteRecord = (id) => deleteDoc(doc(db, "records", id));
