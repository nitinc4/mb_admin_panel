import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// IMPORTANT: Download your service account JSON from Firebase Console -> Project Settings -> Service Accounts
// and place it in the root of your server folder named 'firebase-service-account.json'
const serviceAccountPath = path.resolve('./firebase-service-account.json');

let isFirebaseReady = false;

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  isFirebaseReady = true;
  console.log('✅ Firebase Admin SDK Initialized Successfully');
} else {
  console.warn('⚠️ Firebase Service Account JSON not found. Push notifications will be simulated.');
}

/**
 * Send a notification to multiple FCM tokens
 */
export const sendPushNotification = async (tokens, title, body, imageUrl = null, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  // Filter out empty or null tokens
  const validTokens = tokens.filter(t => t && t.trim() !== '');
  if (validTokens.length === 0) return;

  const message = {
    notification: {
      title,
      body,
      ...(imageUrl && { imageUrl })
    },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK' // Standard for Flutter handling
    },
    tokens: validTokens
  };

  if (isFirebaseReady) {
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`FCM Sent: ${response.successCount} successful, ${response.failureCount} failed.`);
    } catch (error) {
      console.error('Error sending FCM:', error);
    }
  } else {
    console.log(`[SIMULATED PUSH] Title: "${title}" | Sent to ${validTokens.length} devices.`);
  }
};