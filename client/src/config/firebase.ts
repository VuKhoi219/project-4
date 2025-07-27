// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, set,get, update, push, Database, DatabaseReference } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  databaseURL: process.env.REACT_APP_DATABASE_URL, // Thêm dòng này
};

// Debug: Kiểm tra config
console.log('Firebase Config Check:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  hasApiKey: !!firebaseConfig.apiKey
});

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db: Database = getDatabase(app);

// Optional: Initialize Analytics (chỉ khi cần)
// const analytics = getAnalytics(app);

export { db, ref, onValue, set, update, push,get };
export type { Database, DatabaseReference };