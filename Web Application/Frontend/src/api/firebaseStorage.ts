// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyDEnDRIKmYsWExwSLz6jmvuG6FrswbEK9E",
  authDomain: "hiremif-project.firebaseapp.com",
  projectId: "hiremif-project",
  storageBucket: "hiremif-project.appspot.com",
  messagingSenderId: "383598081150",
  appId: "1:383598081150:web:1ebc302a1fb34e784d142f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);