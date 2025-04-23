// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your Firebase configuration from Firebase Console
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

export const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for this
  // URL must be added to the authorized domains list in the Firebase Console.
  // url: process.env.NODE_ENV === 'development'
  //   ? 'http://localhost:3000/reset-password'
  //   : `${process.env.REACT_APP_PRODUCTION_URL}/reset-password`,
  url: 'http://localhost:3000/reset-password?mode=resetPassword',
  
  // This must be true for password reset
  handleCodeInApp: true,
  
  // // Optional settings for mobile apps
  // iOS: {
  //   bundleId: process.env.REACT_APP_IOS_BUNDLE_ID
  // },
  // android: {
  //   packageName: process.env.REACT_APP_ANDROID_PACKAGE_NAME,
  //   installApp: true,
  //   minimumVersion: '12'
  // },
  
  // Optional dynamic link domain for mobile deep linking
  // dynamicLinkDomain: process.env.REACT_APP_DYNAMIC_LINK_DOMAIN
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;