const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const admin = require('firebase-admin'); // Import Firebase admin SDK

// Initialize Firebase Admin SDK
// You need to replace 'path/to/serviceAccountKey.json' with the actual path to your Firebase service account key file
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'firebase-adminsdk-vv1r5@chat-768e3.iam.gserviceaccount.com' // Replace with your Firebase database URL
});

const db = admin.firestore(); // Get Firestore database instance

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pusher = new Pusher({
    appId: "1770587",
    key: "2ad13bef5022d983147b",
    secret: "49ae4a0266132250d14a",
    cluster: "ap2",
    useTLS: true
  });

// Define routes

app.post('/api/messages', async (req, res) => {
    try {
      const { chatId, message } = req.body;
  
      // Save the message to your Firebase database
      const chatRef = db.collection('chats').doc(chatId);
      await chatRef.update({
        messages: admin.firestore.FieldValue.arrayUnion(message),
      });
  
      // Trigger Pusher event
      pusher.trigger(`chat-${chatId}`, 'message', message);
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });