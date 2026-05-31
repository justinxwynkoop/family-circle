import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA_wegtOn27BqwMQB1TUDjYXskL-JHqwCY',
  authDomain: 'family-circle-tracking.firebaseapp.com',
  projectId: 'family-circle-tracking',
  storageBucket: 'family-circle-tracking.firebasestorage.app',
  messagingSenderId: '482941074376',
  appId: '1:482941074376:web:46ec846866e66f1b9a5efd',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
