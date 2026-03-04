import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Check Render's secure path first, fallback to local root for development
const renderSecretPath = '/etc/secrets/firebase-service-account.json';
const localSecretPath = path.resolve('./firebase-service-account.json');

let serviceAccountPath = null;

if (fs.existsSync(renderSecretPath)) {
  serviceAccountPath = renderSecretPath;
} else if (fs.existsSync(localSecretPath)) {
  serviceAccountPath = localSecretPath;
}

let isFirebaseReady = false;

if (serviceAccountPath) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseReady = true;
    console.log(`✅ Firebase Admin SDK Initialized Successfully from: ${serviceAccountPath}`);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  console.warn('⚠️ Firebase Service Account JSON not found in /etc/secrets or local root. Push notifications will be simulated.');
}

/**
 * Send a notification to multiple FCM tokens
 * @param {Array<String>} tokens - Array of device tokens
 * @param {String} title - Notification Title
 * @param {String} body - Notification Body
 * @param {String} imageUrl - Optional Image URL
 * @param {Object} data - Key-value pairs for handling clicks in Flutter
 */
export const sendPushNotification = async (tokens, title, body, imageUrl = null, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  // Filter out empty, null, or undefined tokens
  const validTokens = tokens.filter(t => t && typeof t === 'string' && t.trim() !== '');
  if (validTokens.length === 0) return;

  // Ensure all values in the data object are strings (FCM requirement)
  const stringifiedData = {};
  for (const [key, value] of Object.entries(data)) {
      stringifiedData[key] = String(value);
  }

  const message = {
    notification: {
      title,
      body,
      ...(imageUrl && { imageUrl })
    },
    data: {
      ...stringifiedData,
      click_action: 'FLUTTER_NOTIFICATION_CLICK' // Standard for background handling in Flutter
    },
    tokens: validTokens,
    // Android specific settings for high priority
    android: {
      priority: 'high',
      notification: {
        channelId: 'high_importance_channel',
      }
    },
    // iOS specific settings
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
          sound: 'default'
        }
      }
    }
  };

  if (isFirebaseReady) {
    try {
      // Split into batches of 500 (FCM limit for sendEachForMulticast)
      const chunkSize = 500;
      for (let i = 0; i < validTokens.length; i += chunkSize) {
          const chunk = validTokens.slice(i, i + chunkSize);
          message.tokens = chunk;
          const response = await admin.messaging().sendEachForMulticast(message);
          console.log(`FCM Sent Batch: ${response.successCount} successful, ${response.failureCount} failed.`);
      }
    } catch (error) {
      console.error('Error sending FCM:', error);
    }
  } else {
    console.log(`[SIMULATED PUSH] Title: "${title}" | Body: "${body}" | Sent to ${validTokens.length} devices.`);
    console.log(`[SIMULATED PUSH DATA]`, stringifiedData);
  }
};