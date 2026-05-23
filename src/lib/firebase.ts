import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the correct firestoreDatabaseId in getFirestore!
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard diagnostic connection test to ensure client-to-cloud security rules are aligned
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or networks.");
    }
  }
}
testConnection();
