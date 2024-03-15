import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhHA0TyFkF6HEd54uH0Ru6oWIBPsVkq7g",
  authDomain: "chat-dd99b.firebaseapp.com",
  projectId: "chat-dd99b",
  storageBucket: "chat-dd99b.appspot.com",
  messagingSenderId: "144656569284",
  appId: "1:144656569284:web:e0a971cbd313fc9e764a91",
  measurementId: "G-QPK76M2T57"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()
