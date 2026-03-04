import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import UserNotification from '../models/UserNotification.js';

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

export const sendPushNotification = async (tokens, title, body, imageUrl = null, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  const validTokens = tokens.filter(t => t && typeof t === 'string' && t.trim() !== '');
  if (validTokens.length === 0) return;

  const stringifiedData = {};
  for (const [key, value] of Object.entries(data)) {
      stringifiedData[key] = String(value);
  }

  const message = {
    notification: { title, body, ...(imageUrl && { imageUrl }) },
    data: { ...stringifiedData, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
    tokens: validTokens,
    android: { priority: 'high', notification: { channelId: 'high_importance_channel' } },
    apns: { payload: { aps: { contentAvailable: true, sound: 'default' } } }
  };

  if (isFirebaseReady) {
    try {
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
    console.log(`[SIMULATED PUSH] Title: "${title}" | Sent to ${validTokens.length} devices.`);
  }
};

/**
 * NEW: Saves notification to DB and fires Push Notification
 */
export const notifyUsers = async (userIds, title, body, data, type, relatedId = null) => {
  if (!userIds || userIds.length === 0) return;

  try {
    const users = await User.find({ _id: { $in: userIds } }).select('_id fcm_token');
    
    // 1. Save to DB for the In-App Notification Panel
    const notificationsToSave = users.map(u => ({
      user: u._id, title, body, type,
      relatedId: relatedId ? String(relatedId) : null,
      isRead: false
    }));

    if (notificationsToSave.length > 0) {
      await UserNotification.insertMany(notificationsToSave);
    }

    // 2. Extract tokens and send Push
    const tokens = users.map(u => u.fcm_token).filter(t => t);
    if (tokens.length > 0) {
      await sendPushNotification(tokens, title, body, null, data);
    }
  } catch (error) {
    console.error('Error in notifyUsers:', error);
  }
};

/**
 * NEW: Helper to find all users enrolled in a specific batch
 */
export const getUsersForBatch = async (batch) => {
  if (!batch) return [];
  const users = await User.find({
    $or: [
      { enrolledBatches: batch._id },
      { tier: { $in: batch.allowedTiers || [] } }
    ]
  }).select('_id');
  return users.map(u => u._id);
};