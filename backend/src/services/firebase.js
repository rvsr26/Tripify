import admin from 'firebase-admin';

// Initialize firebase admin only if the environment variable is present
export const initFirebase = () => {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      let saString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      // Remove surrounding quotes if any (common in some env setups)
      if (saString.startsWith("'") && saString.endsWith("'")) {
        saString = saString.slice(1, -1);
      } else if (saString.startsWith('"') && saString.endsWith('"')) {
        saString = saString.slice(1, -1);
      }
      
      const serviceAccount = JSON.parse(saString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin initialized');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT not found in env. Push notifications simulated.');
    }
  } catch (err) {
    console.error('Error initializing firebase admin:', err);
  }
};

export const sendPushNotification = async (token, title, body, data = {}) => {
  // If not initialized, simulate it.
  if (!admin.apps.length) {
    console.log(`[Simulated Push] To: ${token} | Title: ${title} | Body: ${body}`);
    return;
  }
  
  try {
    const message = {
      notification: { title, body },
      data,
      token
    };
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Build verification patch on 11/28/2025, 11:02:00 AM
