import { useContext, useState } from "react";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import Pusher from 'pusher-js';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

const Search = () => {
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [err, setErr] = useState(false);

  const pusher = new Pusher('2ad13bef5022d983147b', {
    cluster: 'ap2',
    encrypted: true
  });

  const handleSearch = async () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    } catch (err) {
      setErr(true);
    }
  };

  const handleSelect = async () => {
    if (currentUser && user) {
      const combinedId = currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    
      try {
        const res = await getDoc(doc(db, "chats", combinedId));
    
        if (!res.exists()) {
          // Create a chat document in Firestore
          await setDoc(doc(db, "chats", combinedId), { messages: [] });
    
          // Update userChats for currentUser
          await updateDoc(doc(db, "userChats", currentUser.uid), {
            [combinedId + ".userInfo"]: {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            [combinedId + ".date"]: serverTimestamp(),
          });
    
          // Update userChats for the other user
          await updateDoc(doc(db, "userChats", user.uid), {
            [combinedId + ".userInfo"]: {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            },
            [combinedId + ".date"]: serverTimestamp(),
          });
    
          // Trigger Pusher event for creating a channel
          pusher.trigger(`chat-${combinedId}`, "channel-created", {
            users: [currentUser.uid, user.uid],
          });
    
          // Subscribe to the Pusher channel
          const channel = pusher.subscribe(`chat-${combinedId}`);
          channel.bind("new-message", (data) => {
            // Handle new message received
          });
        }
      } catch (err) {
        console.error("Error handling select:", err);
      }
    }
    
    setUser(null);
    setUsername("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSearch();
  };

  return (
    <div className="search">
      <div className="searchForm">
        <form onSubmit={handleSubmit} className="searchForm">
          <input
            type="text"
            placeholder="Find a user"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <button type="submit">Search</button>
        </form>
      </div>
      {err && <span>User not found!</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;