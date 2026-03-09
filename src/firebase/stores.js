// src/firebase/stores.js
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const STORES_COLLECTION = 'stores';

// 전체 매장 목록 실시간 구독
export const subscribeToStores = (callback) => {
  const q = query(collection(db, STORES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const stores = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(stores);
  });
};

// 매장 등록
export const addStore = async (storeData) => {
  const docRef = await addDoc(collection(db, STORES_COLLECTION), {
    ...storeData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

// 매장 수정
export const updateStore = async (storeId, storeData) => {
  const storeRef = doc(db, STORES_COLLECTION, storeId);
  await updateDoc(storeRef, {
    ...storeData,
    updatedAt: serverTimestamp()
  });
};

// 재고 업데이트
export const updateStock = async (storeId, newCount) => {
  const storeRef = doc(db, STORES_COLLECTION, storeId);
  await updateDoc(storeRef, {
    duzzonCount: newCount,
    updatedAt: serverTimestamp()
  });
};

// 매장 삭제
export const deleteStore = async (storeId) => {
  await deleteDoc(doc(db, STORES_COLLECTION, storeId));
};
