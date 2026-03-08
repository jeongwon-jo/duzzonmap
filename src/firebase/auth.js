// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

export const registerOwner = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginOwner = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutOwner = async () => {
  return await signOut(auth);
};

export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};
