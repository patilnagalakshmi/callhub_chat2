import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import Lottie from 'lottie-react'
import animationData from '../animations/login_anime.json';

const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      // Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      await uploadBytesResumable(storageRef, file).then(async () => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            // Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });

            console.log('New user is added into the database')

            // Create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL, // Use the downloadURL directly
            });

            // Create empty user chats on firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            navigate("/");
          } catch (err) {
            console.error("Error updating profile or adding user to Firestore:", err);
            setErr(true);
            setLoading(false);
          }
        });
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setErr(true);
      setLoading(false);
    }
  };

  // Rest of your component code...



  return (
    <div className="formContainer">
      <div className='lottie-style' id='lottie'>
              <Lottie 
                      style={{
                      top: "5%",
                      width:"300px",
                      height:"95%",
                      zIndex: -1,
                      overflow: "hidden",
                  position: "absolute"
                      }} 
                      animationData={animationData}/>
          </div>
      <div className="formWrapper">
        <span className="logo">Callhub Chat</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="display name" />
          <input required type="email" placeholder="email" />
          <input required type="password" placeholder="password" />
          <input required style={{ display: "none" }} type="file" id="file" />
          <label htmlFor="file">
            <img src={Add} alt="" />
            <span>Add an avatar</span>
          </label>
          <button disabled={loading}>Sign up</button>
          {loading && "Uploading and compressing the image please wait..."}
          {err && <span>Something went wrong</span>}
        </form>
        <p>
          You do have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
